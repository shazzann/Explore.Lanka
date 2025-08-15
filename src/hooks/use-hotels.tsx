import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Hotel {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  image_url?: string;
  website_url?: string;
  bonus_points?: number;
  is_active?: boolean;
  created_at?: string;
}

export const useHotels = () => {
  const { data: hotels = [], isLoading, error } = useQuery({
    queryKey: ['hotels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching hotels:', error);
        throw error;
      }

      return data as Hotel[];
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  return {
    hotels,
    isLoading,
    error
  };
};