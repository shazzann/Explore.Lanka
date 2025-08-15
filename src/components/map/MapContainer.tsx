
import React, { useState, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Location } from '@/components/LocationCard';
import { MapMarkers } from './MapMarkers';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, LockIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MapContainerProps {
  locations: Location[];
  isLoading: boolean;
  onLocationSelect?: (location: Location) => void;
  onLocationUnlock: (locationId: string) => Promise<Location | null>;
  selectedLocation?: Location | null;
}

const MapContainer: React.FC<MapContainerProps> = ({ 
  locations,
  isLoading,
  onLocationSelect,
  onLocationUnlock,
  selectedLocation
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch Mapbox token on component mount
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          throw error;
        }
        
        if (data.token) {
          setMapboxToken(data.token);
          mapboxgl.accessToken = data.token;
        } else {
          throw new Error('No token received');
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        setTokenError('Failed to load map token. Please check configuration.');
      }
    };
    
    fetchMapboxToken();
  }, []);
  
  // Get user's current position
  const getUserLocation = () => {
    if (navigator.geolocation) {
      toast({
        title: "Getting your location",
        description: "Please allow location access when prompted.",
      });
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setUserLocation(newLocation);
          
          // Center the map on user's location if map exists
          if (map.current) {
            map.current.flyTo({
              center: [newLocation.lng, newLocation.lat],
              zoom: 13,
              essential: true
            });
            
            // Show a marker at the user's position
            const el = document.createElement('div');
            el.className = 'user-location-marker';
            
            new mapboxgl.Marker({
              element: el,
              color: '#0284c7'
            })
              .setLngLat([newLocation.lng, newLocation.lat])
              .addTo(map.current);
          }
          
          toast({
            title: "Location found",
            description: "Map centered on your current location.",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location error",
            description: "Could not access your location. Please enable GPS and try again.",
            variant: "destructive",
          });
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast({
        title: "GPS not supported",
        description: "Your browser doesn't support geolocation services.",
        variant: "destructive",
      });
    }
  };
  
  // Initialize map on component mount
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxToken) return;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [80.7718, 7.8731], // Sri Lanka coordinates
        zoom: 7
      });
      
      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    } catch (error) {
      console.error("Error initializing map:", error);
      setTokenError('Failed to initialize map. Please check token configuration.');
    }
    
    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);
  
  // Focus on selected location when it changes
  useEffect(() => {
    if (map.current && selectedLocation) {
      map.current.flyTo({
        center: [selectedLocation.longitude, selectedLocation.latitude],
        zoom: 14,
        essential: true
      });
    }
  }, [selectedLocation]);
  
  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
      <div 
        ref={mapContainer} 
        className="w-full h-full"
      />
      
      {map.current && locations.length > 0 && (
        <MapMarkers 
          map={map.current} 
          locations={locations}
          onLocationSelect={onLocationSelect}
          onLocationUnlock={onLocationUnlock}
        />
      )}
      
      <div className="absolute bottom-4 left-4 z-10">
        <Button 
          variant="secondary" 
          size="sm" 
          className="shadow-md"
          onClick={getUserLocation}
        >
          <MapPin className="h-4 w-4 mr-2" /> My Location
        </Button>
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      )}
      
      {tokenError && (
        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center p-4">
          <p className="text-center text-muted-foreground mb-2">
            {tokenError}
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      )}
      
      {!user && (
        <div className="absolute top-4 right-4 z-10 bg-white/95 p-3 rounded-md shadow-md border border-amber-200">
          <div className="flex items-center text-sm font-medium text-amber-600">
            <LockIcon className="h-4 w-4 mr-2" />
            <span>Locations are locked</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">Sign in to unlock locations when you visit them</p>
        </div>
      )}
    </div>
  );
};

export default MapContainer;
