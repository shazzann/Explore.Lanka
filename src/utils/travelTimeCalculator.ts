// Utility functions for calculating travel times between locations

interface Location {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Estimate travel time based on distance and road conditions in Sri Lanka
function estimateTravelTime(distance: number, region1: string, region2: string): number {
  // Base speed assumptions for Sri Lanka (km/h)
  let averageSpeed = 40; // Default for mixed roads
  
  // Adjust speed based on regions
  const urbanRegions = ['Western', 'Colombo', 'Gampaha'];
  const mountainousRegions = ['Central', 'Uva', 'Kandy', 'Nuwara Eliya'];
  const coastalRegions = ['Southern', 'Eastern', 'Northern'];
  
  if (urbanRegions.includes(region1) || urbanRegions.includes(region2)) {
    averageSpeed = 25; // Slower in urban areas
  } else if (mountainousRegions.includes(region1) && mountainousRegions.includes(region2)) {
    averageSpeed = 30; // Slower in mountains
  } else if (coastalRegions.includes(region1) && coastalRegions.includes(region2)) {
    averageSpeed = 50; // Faster on coastal roads
  } else if (
    (mountainousRegions.includes(region1) && coastalRegions.includes(region2)) ||
    (coastalRegions.includes(region1) && mountainousRegions.includes(region2))
  ) {
    averageSpeed = 35; // Mixed terrain
  }
  
  // Calculate time in hours, then convert to minutes
  const timeHours = distance / averageSpeed;
  const timeMinutes = Math.round(timeHours * 60);
  
  // Add buffer time for breaks, traffic, etc.
  const bufferMultiplier = distance > 100 ? 1.3 : distance > 50 ? 1.2 : 1.1;
  
  return Math.round(timeMinutes * bufferMultiplier);
}

// Calculate travel times from current location and between consecutive locations
export function calculateTravelTimes(
  locations: Location[], 
  currentLocation?: { latitude: number; longitude: number }
): Record<string, number> {
  const travelTimes: Record<string, number> = {};
  
  // If current location is provided, calculate travel time from current location to first destination
  if (currentLocation && locations.length > 0) {
    const firstLocation = locations[0];
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      firstLocation.latitude,
      firstLocation.longitude
    );
    
    const travelTime = estimateTravelTime(
      distance,
      'Current Location', // Default region for current location
      (firstLocation as any).region || 'Unknown'
    );
    
    travelTimes[`current-${firstLocation.id}`] = travelTime;
  }
  
  // Calculate travel times between consecutive locations
  for (let i = 0; i < locations.length - 1; i++) {
    const from = locations[i];
    const to = locations[i + 1];
    
    const distance = calculateDistance(
      from.latitude,
      from.longitude,
      to.latitude,
      to.longitude
    );
    
    const travelTime = estimateTravelTime(
      distance,
      (from as any).region || 'Unknown',
      (to as any).region || 'Unknown'
    );
    
    travelTimes[`${from.id}-${to.id}`] = travelTime;
  }
  
  return travelTimes;
}

// Calculate total trip duration including travel from current location
export function calculateTotalTripDuration(
  locations: Location[],
  travelTimes: Record<string, number>,
  currentLocation?: { latitude: number; longitude: number }
): {
  totalTravelTime: number;
  totalVisitTime: number;
  totalDuration: number;
  dailyBreakdown: Array<{
    day: number;
    locations: string[];
    duration: number;
  }>;
  travelFromCurrent?: number;
} {
  let totalTravelTime = 0;
  let totalVisitTime = 0;
  let travelFromCurrent = 0;
  
  // Include travel time from current location to first destination
  if (currentLocation && locations.length > 0) {
    const firstTravelTime = travelTimes[`current-${locations[0].id}`];
    if (firstTravelTime) {
      travelFromCurrent = firstTravelTime;
      totalTravelTime += firstTravelTime;
    }
  }
  
  // Calculate travel times between locations
  Object.entries(travelTimes).forEach(([key, time]) => {
    if (!key.startsWith('current-')) {
      totalTravelTime += time;
    }
  });
  
  // Estimate visit times based on location categories
  locations.forEach(location => {
    const category = (location as any).category?.toLowerCase() || 'other';
    const visitTime = getEstimatedVisitTime(category);
    totalVisitTime += visitTime;
  });
  
  const totalDuration = totalTravelTime + totalVisitTime;
  
  // Break down into days (assume 8-10 hours per day of activities)
  const dailyBreakdown = createDailyBreakdown(locations, travelTimes);
  
  return {
    totalTravelTime,
    totalVisitTime,
    totalDuration,
    dailyBreakdown,
    travelFromCurrent: currentLocation ? travelFromCurrent : undefined
  };
}

function getEstimatedVisitTime(category: string): number {
  const visitTimes: Record<string, number> = {
    'temple': 90,      // 1.5 hours
    'beach': 180,      // 3 hours
    'mountain': 240,   // 4 hours
    'city': 300,       // 5 hours
    'park': 150,       // 2.5 hours
    'museum': 120,     // 2 hours
    'waterfall': 120,  // 2 hours
    'historical': 90,  // 1.5 hours
    'cultural': 120,   // 2 hours
    'adventure': 300,  // 5 hours
    'wildlife': 180,   // 3 hours
    'other': 120       // 2 hours default
  };
  
  return visitTimes[category] || visitTimes['other'];
}

function createDailyBreakdown(
  locations: Location[],
  travelTimes: Record<string, number>
): Array<{ day: number; locations: string[]; duration: number }> {
  const dailyBreakdown = [];
  let currentDay = 1;
  let currentDayDuration = 0;
  let currentDayLocations: string[] = [];
  const maxDailyHours = 8 * 60; // 8 hours in minutes
  
  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];
    const visitTime = getEstimatedVisitTime((location as any).category?.toLowerCase() || 'other');
    const travelTime = i > 0 ? (travelTimes[`${locations[i-1].id}-${location.id}`] || 0) : 0;
    
    const totalTimeForLocation = visitTime + travelTime;
    
    // Check if adding this location would exceed daily limit
    if (currentDayDuration + totalTimeForLocation > maxDailyHours && currentDayLocations.length > 0) {
      // Finish current day
      dailyBreakdown.push({
        day: currentDay,
        locations: [...currentDayLocations],
        duration: currentDayDuration
      });
      
      // Start new day
      currentDay++;
      currentDayDuration = visitTime; // Start new day with just visit time (no travel from previous day)
      currentDayLocations = [location.name];
    } else {
      // Add to current day
      currentDayDuration += totalTimeForLocation;
      currentDayLocations.push(location.name);
    }
  }
  
  // Add the last day if it has locations
  if (currentDayLocations.length > 0) {
    dailyBreakdown.push({
      day: currentDay,
      locations: currentDayLocations,
      duration: currentDayDuration
    });
  }
  
  return dailyBreakdown;
}

// Format duration for display
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
}