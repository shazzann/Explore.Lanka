
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useProfile() {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get user's unlocked locations
  const { data: unlockedLocations, isLoading: locationsLoading } = useQuery({
    queryKey: ['userLocations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_locations')
        .select(`
          *,
          locations (*)
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
  
  // Get user's photos
  const { data: userPhotos, isLoading: photosLoading } = useQuery({
    queryKey: ['userPhotos', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
  
  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (values: { username: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username: values.username,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Manually refresh the profile after update
      await refreshProfile();
      
      return values;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Update avatar mutation
  const updateAvatar = useMutation({
    mutationFn: async (avatarUrl: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Manually refresh the profile after update
      await refreshProfile();
      
      return avatarUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been successfully updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update avatar. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle avatar upload complete
  const handleAvatarUpload = (url: string) => {
    updateAvatar.mutate(url);
  };

  // Delete account mutation
  const deleteAccount = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase.rpc('delete_user_account', {
        user_id_param: user.id
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Account deleted',
        description: 'Your account and all data have been permanently deleted.',
      });
      // User will be automatically signed out due to account deletion
    },
    onError: (error: any) => {
      toast({
        title: 'Deletion failed',
        description: error.message || 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  return {
    unlockedLocations,
    locationsLoading,
    userPhotos,
    photosLoading,
    updateProfile,
    updateAvatar,
    handleAvatarUpload,
    deleteAccount,
  };
}
