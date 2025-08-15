import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Clock, Route, Info, X, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Map from '@/components/Map';
import { Location } from '@/components/LocationCard';
import { useTripPlans, TripPlanFormData } from '@/hooks/use-trip-plans';
import { useLocations } from '@/hooks/use-locations';
import TripPlanList from '@/components/TripPlanList';
import AITripPlanner from '@/components/AITripPlanner';
import TripLocationDetails from '@/components/TripLocationDetails';
import { calculateTravelTimes, calculateTotalTripDuration, formatDuration } from '@/utils/travelTimeCalculator';

interface TripLocation {
  id: string;
  name: string;
  order: number;
}

interface TripPlanForm {
  title: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  locations: TripLocation[];
  notes: string;
  accommodation: string;
  transportation: string;
}


const TripPlanner = () => {
  const [currentTab, setCurrentTab] = useState<string>('plan');
  const [tripPlan, setTripPlan] = useState<TripPlanForm>({
    title: '',
    startDate: undefined,
    endDate: undefined,
    locations: [],
    notes: '',
    accommodation: '',
    transportation: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showLocationDetails, setShowLocationDetails] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { createTripPlan } = useTripPlans();
  const { locations: allLocations } = useLocations();
  
  // Get user's current location
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationPermission('granted');
        },
        (error) => {
          console.error('Error getting current location:', error);
          setLocationPermission('denied');
          if (error.code === error.PERMISSION_DENIED) {
            toast({
              title: "Location Access Denied",
              description: "Travel times will be calculated between destinations only.",
              variant: "default",
            });
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      setLocationPermission('denied');
    }
  }, [toast]);
  
  // Calculate travel times and trip duration
  const { travelTimes, tripDuration } = useMemo(() => {
    if (tripPlan.locations.length === 0) return { travelTimes: {}, tripDuration: null };
    
    const locationsWithData = tripPlan.locations.map(tripLoc => {
      const fullLocation = allLocations.find(loc => loc.id === tripLoc.id);
      return fullLocation ? { ...fullLocation, order: tripLoc.order } : null;
    }).filter(Boolean) as (Location & { order: number })[];
    
    if (locationsWithData.length === 0) return { travelTimes: {}, tripDuration: null };
    
    const times = calculateTravelTimes(locationsWithData, currentLocation || undefined);
    const duration = calculateTotalTripDuration(locationsWithData, times, currentLocation || undefined);
    
    return { travelTimes: times, tripDuration: duration };
  }, [tripPlan.locations, allLocations, currentLocation]);

  const handleAddLocation = (location: Location) => {
    console.log('Adding location to trip:', location.name, location.id);
    
    if (tripPlan.locations.some(loc => loc.id === location.id)) {
      toast({
        title: "Already added",
        description: "This location is already in your trip plan.",
        variant: "destructive",
      });
      return;
    }
    
    setTripPlan(prev => {
      const updatedPlan = {
        ...prev,
        locations: [
          ...prev.locations, 
          { 
            id: location.id, 
            name: location.name,
            order: prev.locations.length
          }
        ]
      };
      console.log('Updated trip plan:', updatedPlan);
      return updatedPlan;
    });
    
    toast({
      title: "Location added",
      description: `${location.name} has been added to your trip plan.`,
    });
  };
  
  const handleRemoveLocation = (locationId: string) => {
    setTripPlan(prev => ({
      ...prev,
      locations: prev.locations.filter(loc => loc.id !== locationId)
        .map((loc, index) => ({ ...loc, order: index }))
    }));
  };
  
  const handleReorderLocations = (reorderedLocations: TripLocation[]) => {
    setTripPlan(prev => ({
      ...prev,
      locations: reorderedLocations
    }));
  };
  
  const handleLocationDetails = (locationId: string) => {
    const location = allLocations.find(loc => loc.id === locationId);
    if (location) {
      setSelectedLocation(location);
      setShowLocationDetails(true);
    }
  };
  
  const handleSavePlan = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your trip plan.",
        variant: "destructive",
      });
      return;
    }
    
    if (!tripPlan.title) {
      toast({
        title: "Missing information",
        description: "Please give your trip a title.",
        variant: "destructive",
      });
      return;
    }
    
    if (!tripPlan.startDate) {
      toast({
        title: "Missing information",
        description: "Please select a start date for your trip.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const formData: TripPlanFormData = {
        title: tripPlan.title,
        start_date: tripPlan.startDate?.toISOString(),
        end_date: tripPlan.endDate?.toISOString(),
        notes: tripPlan.notes,
        accommodation: tripPlan.accommodation,
        transportation: tripPlan.transportation,
        locations: tripPlan.locations
      };
      
      await createTripPlan.mutateAsync(formData);
      
      // Reset the form after successful save
      setTripPlan({
        title: '',
        startDate: undefined,
        endDate: undefined,
        locations: [],
        notes: '',
        accommodation: '',
        transportation: ''
      });
      
      // Switch to "My Trips" tab
      setCurrentTab('trips');
    } catch (error) {
      console.error("Error saving trip plan:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 container px-4 md:px-6 py-6">
        <h1 className="text-3xl font-bold mb-2">Trip Planner</h1>
        <p className="text-muted-foreground mb-6">Design your perfect Sri Lanka adventure</p>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="plan">Manual Plan</TabsTrigger>
            <TabsTrigger value="ai">AI Planner</TabsTrigger>
            <TabsTrigger value="trips">My Trips</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plan" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Column */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="p-4">
                  <h2 className="font-semibold text-lg mb-4">Trip Details</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Trip Title</Label>
                      <Input 
                        id="title" 
                        placeholder="My Sri Lanka Adventure" 
                        value={tripPlan.title}
                        onChange={(e) => setTripPlan(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {tripPlan.startDate ? (
                                format(tripPlan.startDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={tripPlan.startDate}
                              onSelect={(date) => setTripPlan(prev => ({ ...prev, startDate: date }))}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                              disabled={!tripPlan.startDate}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {tripPlan.endDate ? (
                                format(tripPlan.endDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={tripPlan.endDate}
                              onSelect={(date) => setTripPlan(prev => ({ ...prev, endDate: date }))}
                              disabled={(date) => {
                                if (!tripPlan.startDate) return true;
                                return date < tripPlan.startDate;
                              }}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="transportation">Transportation</Label>
                      <Select 
                        value={tripPlan.transportation} 
                        onValueChange={(value) => setTripPlan(prev => ({ ...prev, transportation: value }))}
                      >
                        <SelectTrigger id="transportation">
                          <SelectValue placeholder="Select transportation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rental-car">Rental Car</SelectItem>
                          <SelectItem value="driver">Private Driver</SelectItem>
                          <SelectItem value="public">Public Transport</SelectItem>
                          <SelectItem value="tour">Group Tour</SelectItem>
                          <SelectItem value="mix">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="accommodation">Accommodation Preference</Label>
                      <Select 
                        value={tripPlan.accommodation} 
                        onValueChange={(value) => setTripPlan(prev => ({ ...prev, accommodation: value }))}
                      >
                        <SelectTrigger id="accommodation">
                          <SelectValue placeholder="Select accommodation type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="luxury">Luxury</SelectItem>
                          <SelectItem value="mid-range">Mid-Range</SelectItem>
                          <SelectItem value="budget">Budget</SelectItem>
                          <SelectItem value="hostel">Hostels</SelectItem>
                          <SelectItem value="mix">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea 
                        id="notes" 
                        placeholder="Special requirements or preferences..." 
                        value={tripPlan.notes}
                        onChange={(e) => setTripPlan(prev => ({ ...prev, notes: e.target.value }))}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </Card>
                
                {/* Selected Locations List */}
                <Card className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-lg">Selected Locations</h2>
                    <span className="text-sm text-muted-foreground">{tripPlan.locations.length} locations</span>
                  </div>
                  
                  <ScrollArea className="max-h-[400px] pr-4">
                    {tripPlan.locations.length > 0 ? (
                      <div className="space-y-3">
                        {tripPlan.locations.map((location, index) => {
                          let travelTime: number | undefined;
                          let travelLabel = '';
                          
                          if (index === 0 && currentLocation) {
                            // First location: travel time from current location
                            travelTime = travelTimes[`current-${location.id}`];
                            travelLabel = 'from current location';
                          } else if (index > 0) {
                            // Subsequent locations: travel time from previous location
                            const prevLocationId = tripPlan.locations[index - 1].id;
                            travelTime = travelTimes[`${prevLocationId}-${location.id}`];
                            travelLabel = `from ${tripPlan.locations[index - 1].name}`;
                          }
                          
                          console.log(`Location ${index + 1} (${location.name}): travelTime=${travelTime}, label=${travelLabel}`);
                          
                          return (
                            <div key={location.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-medium text-sm">
                                  {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium truncate">{location.name}</h3>
                                  {travelTime && (
                                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        {travelTime}min {travelLabel}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleLocationDetails(location.id)}
                                  className="h-8 w-8"
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleRemoveLocation(location.id)}
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <MapPin className="h-12 w-12 mb-4 opacity-50" />
                        <h3 className="font-medium text-foreground mb-2">No locations selected</h3>
                        <p className="text-sm">Click on locations in the map to add them to your trip plan</p>
                        <p className="text-xs mt-1 opacity-75">You can add both visited and unvisited locations</p>
                      </div>
                    )}
                  </ScrollArea>
                </Card>
                
                {/* Trip Duration Summary */}
                {tripDuration && (
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold">Trip Duration</h3>
                      {currentLocation && (
                        <div className="ml-auto flex items-center gap-1 text-xs text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>From your location</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      {tripDuration.travelFromCurrent && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Travel from current location:</span>
                          <span className="text-green-600 font-medium">{formatDuration(tripDuration.travelFromCurrent)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Travel Time:</span>
                        <span>{formatDuration(tripDuration.totalTravelTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Visit Time:</span>
                        <span>{formatDuration(tripDuration.totalVisitTime)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total Duration:</span>
                        <span>{formatDuration(tripDuration.totalDuration)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Suggested Days:</span>
                        <span>{tripDuration.dailyBreakdown.length} days</span>
                      </div>
                    </div>
                  </Card>
                )}
                
                <Card className="p-4">
                  <Button
                    className="w-full bg-lanka-blue hover:bg-lanka-blue/90"
                    onClick={handleSavePlan}
                    disabled={isLoading || !user}
                  >
                    {isLoading ? 'Saving...' : 'Save Trip Plan'}
                  </Button>
                </Card>
              </div>
              
              {/* Map Column */}
              <div className="lg:col-span-2">
                <Card className="p-4">
                  <div className="flex justify-end mb-4">
                    <div className="text-xs text-muted-foreground">
                      💡 Click any location to add it to your trip plan
                    </div>
                  </div>
                  
                  <Map onLocationSelect={handleAddLocation} />
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="ai" className="mt-0">
            <AITripPlanner onSavePlan={(plan) => {
              setTripPlan({
                title: plan.title,
                startDate: new Date(),
                endDate: new Date(Date.now() + (plan.suggestions.length * 24 * 60 * 60 * 1000)),
                locations: plan.suggestions.map((suggestion, index) => ({
                  id: `ai-${index}`,
                  name: suggestion.location,
                  order: index
                })),
                notes: `AI Generated Plan:\n\nActivities per day:\n${plan.suggestions.map(s => `Day ${s.day}: ${s.activities.join(', ')}\n\nTips: ${s.tips}`).join('\n\n')}`,
                accommodation: plan.budget,
                transportation: plan.transport
              });
              toast({
                title: "AI Plan Imported",
                description: "Your AI-generated trip plan has been imported to the manual planner. You can now edit and save it.",
              });
              setCurrentTab('plan');
            }} />
          </TabsContent>
          
          <TabsContent value="trips" className="mt-0">
            {!user ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Please sign in to view and manage your trip plans
                </p>
                <Button onClick={() => setCurrentTab('plan')}>Create a Trip</Button>
              </div>
            ) : (
              <TripPlanList userId={user.id} />
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Location Details Modal */}
      <TripLocationDetails
        location={selectedLocation}
        isOpen={showLocationDetails}
        onClose={() => setShowLocationDetails(false)}
        onAddToTrip={handleAddLocation}
        isInTrip={selectedLocation ? tripPlan.locations.some(loc => loc.id === selectedLocation.id) : false}
      />
      <Footer />
    </div>
  );
};

export default TripPlanner;
