import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Photo {
  id: string;
  image_url: string;
  caption?: string;
  created_at?: string;
  user_id?: string;
  location_id?: string;
  username?: string;
  avatar_url?: string;
  location_name?: string;
  likes_count?: number;
  user_has_liked?: boolean;
  comments_count?: number;
}

export const usePhotos = () => {
  const { data: photos = [], isLoading, error } = useQuery({
    queryKey: ['photos'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      const currentUserId = session?.session?.user?.id;

      // Get photos first
      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (photosError) {
        console.error('Fetching photos failed:', photosError);
        throw photosError;
      }

      if (!photosData) return [];

      // Get all user profiles for photo owners
      const userIds = [...new Set(photosData.map(p => p.user_id).filter(Boolean))];
      const locationIds = [...new Set(photosData.map(p => p.location_id).filter(Boolean))];

      const [profilesResult, locationsResult, likesResult, commentsResult] = await Promise.all([
        userIds.length > 0 ? supabase.from('profiles').select('id, username, avatar_url').in('id', userIds) : { data: [] },
        locationIds.length > 0 ? supabase.from('locations').select('id, name').in('id', locationIds) : { data: [] },
        supabase.from('photo_likes').select('photo_id, user_id'),
        supabase.from('photo_comments').select('photo_id')
      ]);

      // Create maps for lookups
      const profilesMap: any = {};
      const locationsMap: any = {};
      
      profilesResult.data?.forEach((p: any) => {
        profilesMap[p.id] = p;
      });
      
      locationsResult.data?.forEach((l: any) => {
        locationsMap[l.id] = l;
      });
      
      // Group likes and comments by photo_id
      const likesMap: any = {};
      const commentsMap: any = {};
      
      likesResult.data?.forEach((like: any) => {
        if (!likesMap[like.photo_id]) likesMap[like.photo_id] = [];
        likesMap[like.photo_id].push(like);
      });
      
      commentsResult.data?.forEach((comment: any) => {
        if (!commentsMap[comment.photo_id]) commentsMap[comment.photo_id] = [];
        commentsMap[comment.photo_id].push(comment);
      });

      return photosData.map((photo: any) => {
        const profile = profilesMap[photo.user_id];
        const location = locationsMap[photo.location_id];
        const likes = likesMap[photo.id] || [];
        const comments = commentsMap[photo.id] || [];

        return {
          ...photo,
          username: profile?.username,
          avatar_url: profile?.avatar_url,
          location_name: location?.name,
          likes_count: likes.length,
          user_has_liked: likes.some((like: any) => like.user_id === currentUserId),
          comments_count: comments.length
        };
      }) as Photo[];
    },
    staleTime: 1000 * 60 // 1 minute
  });

  return {
    photos,
    isLoading,
    error
  };
};