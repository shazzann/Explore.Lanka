
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { LeaderboardData, LeaderboardUser } from '@/types/leaderboard';



export const useLeaderboard = () => {
  const [currentTab, setCurrentTab] = useState<string>('overall');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set up real-time subscriptions for instant updates
  useEffect(() => {
    // Listen to profiles table changes (this is where points are updated)
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile points updated, refreshing leaderboard:', payload);
          queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        }
      )
      .subscribe();

    // Listen to photo_likes table changes for immediate point updates
    const likesChannel = supabase
      .channel('photo-likes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'photo_likes'
        },
        (payload) => {
          console.log('Photo like changed, this should trigger profile update:', payload);
          // The trigger will update profiles table, which will trigger the profilesChannel above
        }
      )
      .subscribe();

    // Listen to point activities for real-time leaderboard updates
    const pointActivitiesChannel = supabase
      .channel('point-activities-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'point_activities'
        },
        (payload) => {
          console.log('New point activity, refreshing leaderboard:', payload);
          queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        }
      )
      .subscribe();

    // Listen to user_locations for new location unlocks
    const userLocationsChannel = supabase
      .channel('user-locations-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_locations'
        },
        (payload) => {
          console.log('New location unlocked, refreshing leaderboard:', payload);
          queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        }
      )
      .subscribe();

    // Listen to locations table changes for point updates
    const locationsChannel = supabase
      .channel('locations-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'locations'
        },
        (payload) => {
          console.log('Location points changed, this should trigger profile update:', payload);
          // The existing trigger will update profiles table, which will trigger the profilesChannel above
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(pointActivitiesChannel);
      supabase.removeChannel(userLocationsChannel);
      supabase.removeChannel(locationsChannel);
    };
  }, [queryClient]);

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['leaderboard', currentTab],
    queryFn: async (): Promise<LeaderboardData> => {
      try {
        let leaderboardUsers: LeaderboardUser[] = [];

        if (currentTab === 'overall') {
          // For overall leaderboard, use existing profiles table
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .order('points', { ascending: false })
            .limit(20);
          
          if (error) throw error;
          
          leaderboardUsers = profiles.map((profile, index) => ({
            id: profile.id,
            name: profile.username || 'Unknown Explorer',
            username: profile.username || 'explorer',
            avatar: profile.avatar_url || null,
            points: profile.points || 0,
            rank: index + 1,
            locationsUnlocked: profile.places_unlocked || 0
          }));
        } else {
          // For weekly/monthly leaderboards, calculate from point activities
          let dateFilter = '';
          if (currentTab === 'weekly') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            dateFilter = oneWeekAgo.toISOString();
          } else if (currentTab === 'monthly') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            dateFilter = oneMonthAgo.toISOString();
          }

          // Get point activities for the period
          const { data: periodActivities, error: activitiesError } = await supabase
            .from('point_activities')
            .select('user_id, points_earned')
            .gte('created_at', dateFilter);

          if (activitiesError) throw activitiesError;

          // Group by user and sum points
          const userPointsMap = new Map<string, number>();
          periodActivities.forEach(activity => {
            const userId = activity.user_id;
            const existing = userPointsMap.get(userId) || 0;
            userPointsMap.set(userId, existing + activity.points_earned);
          });

          // Get user profiles for users who earned points in this period
          const userIds = Array.from(userPointsMap.keys());
          if (userIds.length > 0) {
            const { data: profiles, error: profilesError } = await supabase
              .from('profiles')
              .select('id, username, avatar_url, places_unlocked')
              .in('id', userIds);

            if (profilesError) throw profilesError;

            // Create leaderboard entries
            const sortedUsers = profiles
              .map(profile => ({
                id: profile.id,
                name: profile.username || 'Unknown Explorer',
                username: profile.username || 'explorer',
                avatar: profile.avatar_url || null,
                points: userPointsMap.get(profile.id) || 0,
                rank: 0, // Will be set below
                locationsUnlocked: profile.places_unlocked || 0
              }))
              .sort((a, b) => b.points - a.points)
              .slice(0, 20);

            // Assign ranks
            leaderboardUsers = sortedUsers.map((user, index) => ({
              ...user,
              rank: index + 1
            }));
          }
        }
        
        // Find current user in leaderboard or fetch separately if not in top users
        let userEntry: LeaderboardUser | null = null;
        
        if (user) {
          userEntry = leaderboardUsers.find(u => u.id === user.id) || null;
          
          // If current user is not in top users, calculate their period points and rank
          if (!userEntry) {
            if (currentTab === 'overall') {
              // For overall, get from profiles table
              const { data: userProfile, error: userError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
              
              if (!userError && userProfile) {
                const { count, error: countError } = await supabase
                  .from('profiles')
                  .select('*', { count: 'exact', head: true })
                  .gt('points', userProfile.points || 0);
                
                const userRank = countError ? 999 : (count || 0) + 1;
                
                userEntry = {
                  id: userProfile.id,
                  name: userProfile.username || 'Unknown Explorer',
                  username: userProfile.username || 'explorer',
                  avatar: userProfile.avatar_url || null,
                  points: userProfile.points || 0,
                  rank: userRank,
                  locationsUnlocked: userProfile.places_unlocked || 0
                };
              }
            } else {
              // For weekly/monthly, calculate from point activities
              let dateFilter = '';
              if (currentTab === 'weekly') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                dateFilter = oneWeekAgo.toISOString();
              } else if (currentTab === 'monthly') {
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                dateFilter = oneMonthAgo.toISOString();
              }

              // Get user's points for the period
              const { data: userActivities, error: userActivitiesError } = await supabase
                .from('point_activities')
                .select('points_earned')
                .eq('user_id', user.id)
                .gte('created_at', dateFilter);

              if (!userActivitiesError && userActivities) {
                const userPeriodPoints = userActivities.reduce((sum, activity) => 
                  sum + activity.points_earned, 0);

                if (userPeriodPoints > 0) {
                  // Count users with more points in this period
                  const { data: allActivities } = await supabase
                    .from('point_activities')
                    .select('user_id, points_earned')
                    .gte('created_at', dateFilter);

                  const userTotals = new Map<string, number>();
                  allActivities?.forEach(activity => {
                    const current = userTotals.get(activity.user_id) || 0;
                    userTotals.set(activity.user_id, current + activity.points_earned);
                  });

                  const usersWithMorePoints = Array.from(userTotals.values())
                    .filter(points => points > userPeriodPoints).length;

                  // Get user profile for other info
                  const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                  userEntry = {
                    id: user.id,
                    name: userProfile?.username || 'Unknown Explorer',
                    username: userProfile?.username || 'explorer',
                    avatar: userProfile?.avatar_url || null,
                    points: userPeriodPoints,
                    rank: usersWithMorePoints + 1,
                    locationsUnlocked: userProfile?.places_unlocked || 0
                  };
                }
              }
            }
          }
        }
        
        return { 
          users: leaderboardUsers,
          currentUser: userEntry
        };
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load leaderboard data. Please try again.',
          variant: 'destructive'
        });
        return { users: [], currentUser: null };
      }
    },
    staleTime: 1000 * 10, // 10 seconds for faster updates
    refetchInterval: 1000 * 30, // Refresh every 30 seconds for more frequent updates
  });

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  return {
    currentTab,
    handleTabChange,
    leaderboardData: leaderboardData || { users: [], currentUser: null },
    isLoading
  };
};
