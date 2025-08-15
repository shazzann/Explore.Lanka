
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Map from '@/components/Map';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LocationCard from '@/components/LocationCard';
import { LockIcon } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useLocations } from '@/hooks/use-locations';

const GameMode = () => {
  const { user } = useAuth();
  const { locations, isLoading } = useLocations();


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
            <TabsTrigger value="list">Card View</TabsTrigger>
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
      <Footer />
    </div>
  );
};

export default GameMode;
