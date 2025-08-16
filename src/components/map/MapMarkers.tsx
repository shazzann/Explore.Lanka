
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Location } from '@/components/LocationCard';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useHotels } from '@/hooks/use-hotels';
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
  const hotelMarkersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [userCoords, setUserCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [unlockingStates, setUnlockingStates] = useState<{ [key: string]: boolean }>({});
  const { user } = useAuth();
  const { toast } = useToast();
  const { hotels } = useHotels();
  
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
    
    // Set unlock distance - adjust this value to change the radius
    // 0.5 = 500 meters, 1.0 = 1 kilometer, etc.
    const unlockDistance = 0.5; // Change this value to adjust unlock radius
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
      
      // Create hover tooltip
      const createHoverTooltip = () => {
        const tooltip = document.createElement('div');
        tooltip.className = 'location-hover-tooltip';
        tooltip.style.cssText = `
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.95);
          color: white;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          white-space: nowrap;
          z-index: 10000;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
          margin-bottom: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          min-width: 200px;
          text-align: center;
        `;
        
        const statusIcon = location.unlocked ? '🔓' : '🔒';
        const statusText = location.unlocked ? 'Unlocked' : 'Locked';
        const pointsText = location.points ? ` • ${location.points} pts` : '';
        const categoryText = location.category ? ` • ${location.category}` : '';
        
        tooltip.innerHTML = `
          <div style="font-weight: 700; margin-bottom: 4px; font-size: 14px; color: ${location.unlocked ? '#10b981' : '#f59e0b'};">
            ${statusIcon} ${location.name}
          </div>
          <div style="font-size: 11px; opacity: 0.9; color: #e2e8f0;">
            ${statusText}${pointsText} • ${location.region}${categoryText}
          </div>
          <div style="font-size: 10px; opacity: 0.7; margin-top: 2px; color: #cbd5e1;">
            ${location.unlocked ? 'Click to add to trip' : 'Click to add to trip (unlock by visiting)'}
          </div>
        `;
        
        // Add arrow
        const arrow = document.createElement('div');
        arrow.style.cssText = `
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid rgba(15, 23, 42, 0.95);
        `;
        tooltip.appendChild(arrow);
        
        return tooltip;
      };
      
      // Add hover events with improved handling
      let hoverTooltip: HTMLElement | null = null;
      let hoverTimeout: NodeJS.Timeout | null = null;
      
      const showTooltip = () => {
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          hoverTimeout = null;
        }
        
        if (!hoverTooltip) {
          hoverTooltip = createHoverTooltip();
          markerElement.style.position = 'relative';
          markerElement.appendChild(hoverTooltip);
        }
        
        // Small delay to ensure smooth appearance
        setTimeout(() => {
          if (hoverTooltip) {
            hoverTooltip.style.opacity = '1';
          }
        }, 50);
      };
      
      const hideTooltip = () => {
        if (hoverTooltip) {
          hoverTooltip.style.opacity = '0';
          hoverTimeout = setTimeout(() => {
            if (hoverTooltip && hoverTooltip.parentNode) {
              hoverTooltip.parentNode.removeChild(hoverTooltip);
              hoverTooltip = null;
            }
          }, 300);
        }
      };
      
      // Ensure marker has proper cursor and positioning
      markerElement.style.cursor = 'pointer';
      markerElement.style.position = 'relative';
      markerElement.style.zIndex = '100';
      
      markerElement.addEventListener('mouseenter', showTooltip);
      markerElement.addEventListener('mouseleave', hideTooltip);
      
      // Also handle touch events for mobile
      markerElement.addEventListener('touchstart', showTooltip);
      markerElement.addEventListener('touchend', () => {
        setTimeout(hideTooltip, 2000); // Hide after 2 seconds on touch
      });
      
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
        <p>${location.short_description || location.description || ''}</p>
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
        // Always call onLocationSelect for any location click (for trip planning)
        if (onLocationSelect) {
          onLocationSelect(location);
        }
        
        // Handle unlocking for authenticated users (separate from selection)
        if (user && !location.unlocked && !unlockingStates[location.id]) {
          // Check if already unlocking this location
          setUnlockingStates(prev => ({ ...prev, [location.id]: true }));
          
          try {
            // Ensure we have user coordinates before checking proximity
            if (!userCoords) {
              console.log("No user coordinates available, getting position...");
              try {
                await new Promise<void>((resolve, reject) => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        console.log("Got user position:", position.coords.latitude, position.coords.longitude);
                        setUserCoords({
                          lat: position.coords.latitude,
                          lng: position.coords.longitude
                        });
                        resolve();
                      },
                      (error) => {
                        console.error("Error getting location:", error);
                        reject(error);
                      },
                      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                    );
                  } else {
                    reject(new Error("Geolocation not supported"));
                  }
                });
              } catch (error) {
                toast({
                  title: "Location Error",
                  description: "Could not access your location. Please enable GPS and try again.",
                  variant: "destructive",
                });
                return;
              }
            }
            
            // Now check if user is near the location
            const isNear = isUserNearLocation(location.latitude, location.longitude);
            console.log(`Attempting to unlock location: ${location.name}, isNear: ${isNear}`);
            
            // Debug logs to help troubleshoot
            if (userCoords) {
              console.log("User coordinates:", userCoords);
              console.log("Location coordinates:", location.latitude, location.longitude);
              console.log("Distance:", calculateDistance(
                userCoords.lat, userCoords.lng, location.latitude, location.longitude
              ));
            }
            
            if (!isNear) {
              toast({
                title: "You're too far away!",
                description: "You need to be physically at this location to unlock it.",
                variant: "destructive",
              });
              return;
            }
            
            const unlockedLocation = await onLocationUnlock(location.id);
            if (unlockedLocation) {
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
          } finally {
            setUnlockingStates(prev => ({ ...prev, [location.id]: false }));
          }
        } else if (!user && !location.unlocked) {
          toast({
            title: "Sign in required",
            description: "You need to sign in to unlock locations.",
            variant: "destructive",
          });
        } else if (unlockingStates[location.id]) {
          toast({
            title: "Please wait",
            description: "This location is already being unlocked.",
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

  // Add hotel markers
  useEffect(() => {
    if (!map || !hotels.length) return;
    
    // Clear existing hotel markers
    Object.values(hotelMarkersRef.current).forEach(marker => marker.remove());
    hotelMarkersRef.current = {};
    
    // Add hotel markers
    hotels.forEach((hotel) => {
      const markerElement = document.createElement('div');
      markerElement.className = 'hotel-marker';
      markerElement.innerHTML = '🏨';
      markerElement.style.fontSize = '24px';
      markerElement.style.cursor = 'pointer';
      
      const popupHtml = `
        <div class="hotel-popup">
          ${hotel.image_url ? `<img src="${hotel.image_url}" alt="${hotel.name}" class="hotel-image">` : ''}
          <h3>${hotel.name}</h3>
          ${hotel.address ? `<p class="hotel-address">${hotel.address}</p>` : ''}
          ${hotel.description ? `<p class="hotel-description">${hotel.description}</p>` : ''}
          <div class="hotel-points">Bonus Points: ${hotel.bonus_points || 100}</div>
          ${hotel.website_url ? `<a href="${hotel.website_url}" target="_blank" class="hotel-website">Visit Website</a>` : ''}
        </div>
      `;
      
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(popupHtml);
      
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([hotel.longitude, hotel.latitude])
        .setPopup(popup)
        .addTo(map);
      
      hotelMarkersRef.current[hotel.id] = marker;
    });
    
    return () => {
      Object.values(hotelMarkersRef.current).forEach(marker => marker.remove());
    };
  }, [hotels, map]);

  return null; // This component doesn't render anything directly
};
