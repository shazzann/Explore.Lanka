import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const usePhotoLikes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleLike = useMutation({
    mutationFn: async ({ photoId, isLiked }: { photoId: string; isLiked: boolean }) => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;

      if (!userId) {
        throw new Error('Please sign in to like photos');
      }

      if (isLiked) {
        // Unlike the photo
        const { error } = await supabase
          .from('photo_likes')
          .delete()
          .eq('photo_id', photoId)
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Like the photo
        const { error } = await supabase
          .from('photo_likes')
          .insert({
            photo_id: photoId,
            user_id: userId
          });

        if (error) throw error;
      }

      return !isLiked;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update like status",
        variant: "destructive",
      });
    }
  });

  return { toggleLike };
};