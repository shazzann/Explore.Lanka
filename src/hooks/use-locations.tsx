
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Location } from '@/components/LocationCard';

// Fix the TypeScript error by adding the is_active property to the Location type
// directly in the hook since we can't modify the LocationCard file
type ExtendedLocation = Location & {
  is_active?: boolean;
};

export const useLocations = () => {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all locations
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .order('name');
          
        if (error) {
          throw error;
        }
        
        // Fetch unlocked locations for the current user if logged in
        let unlockedLocationIds: string[] = [];
        
        if (user) {
          const { data: unlockedData, error: unlockedError } = await supabase
            .from('user_locations')
            .select('location_id')
            .eq('user_id', user.id);
            
          if (unlockedError) {
            console.error('Error fetching unlocked locations:', unlockedError);
          } else {
            unlockedLocationIds = unlockedData.map(item => item.location_id);
          }
        }
        
        // Map the locations and add the unlocked status
        return data.map((location: any) => ({
          ...location,
          unlocked: user ? unlockedLocationIds.includes(location.id) : false // Always locked for non-logged in users
        }));
      } catch (error) {
        console.error('Error fetching locations:', error);
        return [];
      }
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation to unlock a location
  const unlockMutation = useMutation<ExtendedLocation, Error, string>({
    mutationFn: async (locationId: string) => {
      if (!user) {
        throw new Error('You must be logged in to unlock locations');
      }
      
      // Find the location to unlock
      const location = locations.find((loc: ExtendedLocation) => loc.id === locationId);
      if (!location) throw new Error('Location not found');
      
      setIsUnlocking(true);
      
      // Record that the user unlocked this location
      const { error: unlockError } = await supabase
        .from('user_locations')
        .insert({
          user_id: user.id,
          location_id: locationId,
          points_earned: location.points || 0
        });
        
      if (unlockError) throw unlockError;
      
      // Update the user's profile with the earned points - Remove the 'as any' cast
      const { error: updateError } = await supabase.rpc('increment_profile_stats', {
        user_id_param: user.id,
        points_param: location.points || 0,
        places_unlocked_param: 1
      });
      
      if (updateError) {
        console.error('Error updating profile stats:', updateError);
        throw updateError;
      }
      
      console.log('Profile stats updated successfully for user:', user.id, 'points added:', location.points || 0);
      
      // Return the updated location with unlocked status
      return {
        ...location,
        unlocked: true
      };
    },
    onSuccess: () => {
      // Invalidate and refetch locations and profile data
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      
      console.log('Queries invalidated after location unlock');
      
      toast({
        title: "Location Unlocked!",
        description: "You've earned points for unlocking this location.",
      });
    },
    onError: (error: Error) => {
      console.error('Error in unlock mutation:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUnlocking(false);
    }
  });
  
  // Function to unlock a location
  const unlockLocation = async (locationId: string): Promise<ExtendedLocation | null> => {
    try {
      return await unlockMutation.mutateAsync(locationId);
    } catch (error) {
      console.error("Error in unlockLocation:", error);
      return null;
    }
  };

  // NEW: Mutation to update a location (for admin use)
  const updateLocationMutation = useMutation<
    ExtendedLocation,
    Error,
    ExtendedLocation
  >({
    mutationFn: async (updatedLocation: ExtendedLocation) => {
      if (!user) {
        throw new Error('You must be logged in to edit locations');
      }

      const { data, error } = await supabase
        .from('locations')
        .update({
          name: updatedLocation.name,
          description: updatedLocation.description,
          short_description: updatedLocation.short_description,
          region: updatedLocation.region,
          category: updatedLocation.category,
          latitude: updatedLocation.latitude,
          longitude: updatedLocation.longitude,
          points: updatedLocation.points,
          image_url: updatedLocation.image_url,
          is_active: updatedLocation.is_active
        })
        .eq('id', updatedLocation.id)
        .select('*')
        .single();

      if (error) throw error;
      
      // Keep unlocked status as it was
      const originalLocation = locations.find((loc: ExtendedLocation) => loc.id === updatedLocation.id);
      
      return {
        ...data,
        unlocked: originalLocation?.unlocked || false
      } as ExtendedLocation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      
      toast({
        title: "Location Updated",
        description: "The location has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Function to update a location
  const updateLocation = async (updatedLocation: ExtendedLocation): Promise<ExtendedLocation> => {
    return updateLocationMutation.mutateAsync(updatedLocation);
  };

  return {
    locations: locations as ExtendedLocation[],
    isLoading,
    unlockLocation,
    isUnlocking,
    updateLocation
  };
};

export function useLocationMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createLocation = useMutation({
    mutationFn: async (locationData: Omit<Location, 'id'>) => {
      const { data, error } = await supabase
        .from('locations')
        .insert([locationData])
        .select();
      
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({
        title: "Location created",
        description: "The location has been successfully created.",
      });
    },
    onError: (error: Error) => {
      console.error('Error creating location:', error);
      toast({
        title: "Error",
        description: "Failed to create location. Please try again.",
        variant: 'destructive',
      });
    },
  });

  const updateLocation = useMutation({
    mutationFn: async ({ id, ...locationData }: { id: string } & Partial<Location>) => {
      const { data, error } = await supabase
        .from('locations')
        .update(locationData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({
        title: "Location updated",
        description: "The location has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      console.error('Error updating location:', error);
      toast({
        title: "Error",
        description: "Failed to update location. Please try again.",
        variant: 'destructive',
      });
    },
  });

  const addLocationFact = useMutation({
    mutationFn: async ({ location_id, fact }: { location_id: string, fact: string }) => {
      const { data, error } = await supabase
        .from('location_facts')
        .insert([{ location_id, fact }])
        .select();
      
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({
        title: "Fact added",
        description: "The location fact has been successfully added.",
      });
    },
    onError: (error: Error) => {
      console.error('Error adding fact:', error);
      toast({
        title: "Error",
        description: "Failed to add fact. Please try again.",
        variant: 'destructive',
      });
    },
  });

  return { createLocation, updateLocation, addLocationFact };
}
