
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface TripLocation {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  region: string;
  category: string;
  image_url?: string;
  order_index: number;
}

export interface TripPlan {
  id: string;
  title: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
  accommodation?: string;
  transportation?: string;
  created_at?: string;
  locations: TripLocation[];
}

export interface TripPlanFormData {
  title: string;
  start_date?: string | null;
  end_date?: string | null;
  notes?: string;
  accommodation?: string;
  transportation?: string;
  locations: { id: string; name: string; order: number; }[];
}

export function useTripPlans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch trip plans
  const {
    data: tripPlans = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tripPlans', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get all trip plans for this user
      const { data: tripData, error: tripError } = await supabase
        .from('trip_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (tripError) throw tripError;
      
      // Get all trip_locations with their associated locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('trip_locations')
        .select(`
          id,
          trip_id,
          location_id,
          order_index,
          locations (*)
        `)
        .in('trip_id', tripData.map(trip => trip.id));
      
      if (locationsError) throw locationsError;
      
      // Structure the data into trip plans with their locations
      const plans: TripPlan[] = tripData.map(trip => {
        const tripLocations = locationsData
          .filter(loc => loc.trip_id === trip.id)
          .sort((a, b) => a.order_index - b.order_index)
          .map(loc => ({
            ...loc.locations,
            order_index: loc.order_index
          }));
        
        return {
          ...trip,
          locations: tripLocations
        };
      });
      
      return plans;
    },
    enabled: !!user
  });
  
  // Create a new trip plan
  const createTripPlan = useMutation({
    mutationFn: async (formData: TripPlanFormData) => {
      if (!user) throw new Error('User not authenticated');
      
      // First create the trip plan
      const { data: trip, error: tripError } = await supabase
        .from('trip_plans')
        .insert({
          user_id: user.id,
          title: formData.title,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          notes: formData.notes || null,
          accommodation: formData.accommodation || null,
          transportation: formData.transportation || null
        })
        .select()
        .single();
      
      if (tripError) throw tripError;
      
      // Then create trip_locations for each selected location
      if (formData.locations.length > 0) {
        const locationEntries = formData.locations.map((location) => ({
          trip_id: trip.id,
          location_id: location.id,
          order_index: location.order
        }));
        
        const { error: locationsError } = await supabase
          .from('trip_locations')
          .insert(locationEntries);
        
        if (locationsError) throw locationsError;
      }
      
      return trip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tripPlans', user?.id] });
      toast({
        title: 'Trip Created',
        description: 'Your trip plan has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create trip plan',
        variant: 'destructive',
      });
    }
  });
  
  // Delete a trip plan
  const deleteTripPlan = useMutation({
    mutationFn: async (tripId: string) => {
      // First delete all trip_locations with this trip_id
      const { error: locationError } = await supabase
        .from('trip_locations')
        .delete()
        .eq('trip_id', tripId);
      
      if (locationError) throw locationError;
      
      // Then delete the trip plan itself
      const { error: tripError } = await supabase
        .from('trip_plans')
        .delete()
        .eq('id', tripId);
      
      if (tripError) throw tripError;
      
      return tripId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tripPlans', user?.id] });
      toast({
        title: 'Trip Deleted',
        description: 'Your trip plan has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete trip plan',
        variant: 'destructive',
      });
    }
  });
  
  return {
    tripPlans,
    isLoading,
    error,
    createTripPlan,
    deleteTripPlan,
    refetch
  };
}
