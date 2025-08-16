
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
        // The leaderboard is already invalidated in the unlockLocation function
        // No need to invalidate it again here to prevent duplicate points
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
