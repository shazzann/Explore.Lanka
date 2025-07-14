
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Photo {
  id: string;
  image_url: string;
  caption?: string;
  created_at?: string;
  user_id?: string;
  location_id?: string;
  likes_count?: number;
  username?: string;
  avatar_url?: string;
  location_name?: string;
}

export const usePhotos = () => {
  const { data: photos = [], isLoading, error } = useQuery({
    queryKey: ['photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos')
        .select(`
          *,
          profiles:user_id (username, avatar_url),
          locations:location_id (name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetching photos failed:', error);
        throw error;
      }

      if (!data) return [];
      return data.map(photo => ({
        ...photo,
        username: photo.profiles?.username,
        avatar_url: photo.profiles?.avatar_url,
        location_name: photo.locations?.name
      })) as Photo[];
    },
    staleTime: 1000 * 60 // 1 minute
  });

  return {
    photos,
    isLoading,
    error
  };
};
