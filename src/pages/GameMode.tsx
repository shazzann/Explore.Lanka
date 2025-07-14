
import React from 'react';
import Header from '@/components/Header';
import Map from '@/components/Map';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import LocationCard from '@/components/LocationCard';
import { MapPin, ListFilter, LockIcon } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

const GameMode = () => {
  const { user } = useAuth();
  
  // Fetch all locations and user's unlocked locations
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations', user?.id],
    queryFn: async () => {
      // Fetch all locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('*');
      
      if (locationsError) throw locationsError;
      
      // Fetch all facts for locations
      const { data: factsData, error: factsError } = await supabase
        .from('location_facts')
        .select('*');
      
      if (factsError) throw factsError;
      
      // Fetch user's unlocked locations if logged in
      let userUnlockedLocations: Record<string, boolean> = {};
      
      if (user) {
        const { data: userLocData, error: userLocError } = await supabase
          .from('user_locations')
          .select('location_id')
          .eq('user_id', user.id);
        
        if (userLocError) throw userLocError;
        
        userUnlockedLocations = (userLocData || []).reduce((acc: Record<string, boolean>, curr) => {
          acc[curr.location_id] = true;
          return acc;
        }, {});
      }
      
      // Process locations with facts and unlocked status
      const processedLocations = locationsData.map((loc) => {
        const locationFacts = factsData
          .filter(fact => fact.location_id === loc.id)
          .map(fact => fact.fact);
        
        return {
          ...loc,
          facts: locationFacts,
          unlocked: userUnlockedLocations[loc.id] || false
        };
      });
      
      return processedLocations;
    },
    staleTime: 1000 * 60, // 1 minute
  });

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Current location:", position.coords.latitude, position.coords.longitude);
          // This could be used to update map position or check for nearby locations
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 container px-4 md:px-6 py-6">
        <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Game Mode</h1>
            <p className="text-muted-foreground">
              Visit locations across Sri Lanka and unlock them to earn points
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleCurrentLocation}
            >
              <MapPin className="h-4 w-4" /> Current Location
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ListFilter className="h-4 w-4" /> Filter
            </Button>
          </div>
        </div>
        
        {!user && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center">
            <LockIcon className="h-5 w-5 text-amber-500 mr-3" />
            <div>
              <h3 className="font-medium text-amber-700">Locations are locked</h3>
              <p className="text-sm text-amber-600">
                Sign in and physically visit locations to unlock them and earn points!
              </p>
            </div>
          </div>
        )}
        
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-sm mb-6">
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="mt-0">
            <Map />
          </TabsContent>
          
          <TabsContent value="list" className="mt-0">
            {isLoading ? (
              <div className="flex justify-center my-12">
                <p>Loading locations...</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.map((location) => (
                  <LocationCard 
                    key={location.id} 
                    location={location}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GameMode;
