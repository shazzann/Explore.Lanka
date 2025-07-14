
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { LeaderboardData, LeaderboardUser } from '@/types/leaderboard';

const defaultAvatarUrl = "https://api.dicebear.com/7.x/adventurer/svg?seed=";

export const useLeaderboard = () => {
  const [currentTab, setCurrentTab] = useState<string>('overall');
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['leaderboard', currentTab],
    queryFn: async (): Promise<LeaderboardData> => {
      try {
        // Fetch profiles sorted by points
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .order('points', { ascending: false })
          .limit(20); // Limiting to 20 for better performance
        
        if (error) throw error;
        
        // Transform profiles into leaderboard users
        const leaderboardUsers: LeaderboardUser[] = profiles.map((profile, index) => ({
          id: profile.id,
          name: profile.username || 'Unknown Explorer',
          username: profile.username || 'explorer',
          avatar: profile.avatar_url || `${defaultAvatarUrl}${profile.username || 'explorer'}`,
          points: profile.points || 0,
          rank: index + 1,
          locationsUnlocked: profile.places_unlocked || 0
        }));
        
        // Find current user in leaderboard or fetch separately if not in top users
        let userEntry: LeaderboardUser | null = null;
        
        if (user) {
          userEntry = leaderboardUsers.find(u => u.id === user.id) || null;
          
          // If current user is not in top users, fetch their profile separately
          if (!userEntry) {
            const { data: userProfile, error: userError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
            
            if (!userError && userProfile) {
              // Get user's rank by counting profiles with more points
              const { count, error: countError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gt('points', userProfile.points || 0);
              
              const userRank = countError ? 999 : (count || 0) + 1;
              
              userEntry = {
                id: userProfile.id,
                name: userProfile.username || 'Unknown Explorer',
                username: userProfile.username || 'explorer',
                avatar: userProfile.avatar_url || `${defaultAvatarUrl}${userProfile.username || 'explorer'}`,
                points: userProfile.points || 0,
                rank: userRank,
                locationsUnlocked: userProfile.places_unlocked || 0
              };
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
    staleTime: 1000 * 30, // 30 seconds (reduced from 1 minute for more frequent updates)
    refetchInterval: 1000 * 60 * 2, // Refresh every 2 minutes (more frequent update)
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
