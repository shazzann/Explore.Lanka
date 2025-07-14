
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Location } from '@/components/LocationCard';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LockIcon } from 'lucide-react';

interface MapMarkersProps {
  map: mapboxgl.Map;
  locations: Location[];
  onLocationSelect?: (location: Location) => void;
  onLocationUnlock: (locationId: string) => Promise<Location | null>;
}

export const MapMarkers: React.FC<MapMarkersProps> = ({ 
  map, 
  locations,
  onLocationSelect,
  onLocationUnlock
}) => {
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [userCoords, setUserCoords] = useState<{ lat: number, lng: number } | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Function to get user's current GPS position
  const getCurrentPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Got user position:", position.coords.latitude, position.coords.longitude);
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Could not access your location. Please enable GPS and try again.",
            variant: "destructive",
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast({
        title: "GPS Not Supported",
        description: "Your browser doesn't support geolocation services.",
        variant: "destructive",
      });
    }
  };

  // Function to check if user is near a location (within ~500 meters)
  const isUserNearLocation = (locationLat: number, locationLng: number) => {
    if (!userCoords) {
      console.log("No user coordinates available");
      return false;
    }
    
    // Simple distance calculation (not perfect but good enough for this purpose)
    // Haversine formula would be more accurate for real-world use
    const distance = calculateDistance(
      userCoords.lat, 
      userCoords.lng, 
      locationLat, 
      locationLng
    );
    
    console.log(`Distance to location: ${distance.toFixed(3)} km`);
    
    // For testing/development purposes, increase the distance to 5.0 km (easier to test)
    // For production, set this back to 0.5 km (500 meters)
    const unlockDistance = 5.0; // 5 km for testing, should be 0.5 for production
    const isNear = distance <= unlockDistance;
    
    console.log("Is user near location?", isNear);
    return isNear;
  };

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI/180);
  };

  // Add markers when locations data is loaded
  useEffect(() => {
    if (!map || !locations.length) return;
    
    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};
    
    // Get user position when map loads
    getCurrentPosition();
    
    // Add new markers
    locations.forEach((location) => {
      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.className = `location-marker ${location.unlocked ? 'location-unlocked' : 'location-locked'}`;
      
      // Placeholder image URL for locked locations
      const placeholderImageUrl = "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=300&q=80";
      
      // Create popup HTML with enhanced locked indication and cover image
      let popupHtml = `<div class="${location.unlocked ? '' : 'locked-location-popup'}">`;
      
      // Add location image with overlay for locked locations
      if (!location.unlocked) {
        popupHtml += `
          <div class="location-image-container">
            <img src="${placeholderImageUrl}" alt="Locked location" class="location-image">
            <div class="location-image-overlay">
              <div class="location-image-lock">🔒</div>
            </div>
          </div>
        `;
      } else if (location.image_url) {
        popupHtml += `
          <div class="location-image-container">
            <img src="${location.image_url}" alt="${location.name}" class="location-image">
          </div>
        `;
      }
      
      popupHtml += `
        <h3>${location.name}</h3>
        <p>${location.short_description || ''}</p>
      `;
      
      // Add different content based on unlock status and user login
      if (!location.unlocked) {
        if (user) {
          popupHtml += `
            <div class="lock-message">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              This location is locked
            </div>
            <p class="text-sm">Visit this location in person to unlock</p>
            <button class="unlock-btn">Check Location & Unlock</button>
          `;
        } else {
          popupHtml += `
            <div class="lock-message">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              This location is locked
            </div>
            <p class="text-sm">Sign in required to unlock locations</p>
          `;
        }
      } else {
        popupHtml += `
          <div style="color: #10b981; font-weight: bold; display: flex; align-items: center; margin-top: 5px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 1 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
            Unlocked!
          </div>
          <p class="text-sm">You've already unlocked this location</p>
        `;
      }
      
      popupHtml += `</div>`;
      
      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(popupHtml);
      
      // Create and add marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([location.longitude, location.latitude])
        .setPopup(popup)
        .addTo(map);
      
      // Store marker reference
      markersRef.current[location.id] = marker;
      
      // Add click event to marker
      markerElement.addEventListener('click', async () => {
        // Handle unlocking for authenticated users
        if (user && !location.unlocked) {
          // Get updated position before attempting to unlock
          getCurrentPosition();
          
          // Wait a moment for the position to update
          setTimeout(async () => {
            // Check if user is near the location
            const isNear = isUserNearLocation(location.latitude, location.longitude);
            console.log(`Attempting to unlock location: ${location.name}, isNear: ${isNear}`);
            
            // Debug logs to help troubleshoot
            if (userCoords) {
              console.log("User coordinates:", userCoords);
              console.log("Location coordinates:", location.latitude, location.longitude);
              console.log("Distance:", calculateDistance(
                userCoords.lat, userCoords.lng, location.latitude, location.longitude
              ));
            } else {
              console.log("No user coordinates available yet");
            }
            
            if (!isNear) {
              toast({
                title: "You're too far away!",
                description: "You need to be physically at this location to unlock it.",
                variant: "destructive",
              });
              return;
            }
            
            try {
              const unlockedLocation = await onLocationUnlock(location.id);
              if (unlockedLocation && onLocationSelect) {
                onLocationSelect(unlockedLocation);
                toast({
                  title: "Success!",
                  description: `You've unlocked ${location.name}!`,
                });
              }
            } catch (error) {
              console.error("Error unlocking location:", error);
              toast({
                title: "Error",
                description: "Failed to unlock location. Please try again.",
                variant: "destructive",
              });
            }
          }, 1000); // Allow 1 second for position to update
        } else if (location.unlocked && onLocationSelect) {
          onLocationSelect(location);
        } else if (!user) {
          toast({
            title: "Sign in required",
            description: "You need to sign in to unlock locations.",
            variant: "destructive",
          });
        }
      });
    });
    
    // Clean up on unmount
    return () => {
      if (map) {
        Object.values(markersRef.current).forEach(marker => marker.remove());
      }
    };
  }, [locations, map, onLocationSelect, onLocationUnlock, user, toast]);

  return null; // This component doesn't render anything directly
};
