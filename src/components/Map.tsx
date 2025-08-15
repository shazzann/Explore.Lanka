
import React, { useState, useEffect } from 'react';
import { useLocations } from '@/hooks/use-locations';
import MapContainer from './map/MapContainer';
import { Location } from '@/components/LocationCard';
import '../styles/map-markers.css';
import { useQueryClient } from '@tanstack/react-query';

interface MapProps {
  onLocationSelect?: (location: Location) => void;
}

const Map: React.FC<MapProps> = ({ onLocationSelect }) => {
  const { locations, isLoading, unlockLocation } = useLocations();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const queryClient = useQueryClient();
  
  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };
  
  const handleLocationUnlock = async (locationId: string): Promise<Location | null> => {
    try {
      const unlockedLocation = await unlockLocation(locationId);
      if (unlockedLocation) {
        handleLocationSelect(unlockedLocation);
        
        // Ensure leaderboard is immediately refreshed after a successful unlock
        queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        console.log("Leaderboard data invalidated after location unlock");
      }
      return unlockedLocation;
    } catch (error) {
      console.error('Error unlocking location:', error);
      return null;
    }
  };
  
  return (
    <MapContainer
      locations={locations}
      isLoading={isLoading}
      onLocationSelect={handleLocationSelect}
      onLocationUnlock={handleLocationUnlock}
      selectedLocation={selectedLocation}
    />
  );
};

export default Map;
