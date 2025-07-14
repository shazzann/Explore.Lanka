import React, { useState } from 'react';
import Header from '@/components/Header';
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
import { CalendarIcon, X, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Map from '@/components/Map';
import { Location } from '@/components/LocationCard';
import { useTripPlans, TripPlanFormData } from '@/hooks/use-trip-plans';
import TripPlanList from '@/components/TripPlanList';

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

const regions = [
  "Central Province",
  "Northern Province",
  "Southern Province",
  "Eastern Province",
  "Western Province",
  "North Western Province",
  "North Central Province",
  "Uva Province",
  "Sabaragamuwa Province"
];

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
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { createTripPlan } = useTripPlans();

  const handleAddLocation = (location: Location) => {
    if (tripPlan.locations.some(loc => loc.id === location.id)) {
      toast({
        title: "Already added",
        description: "This location is already in your trip plan.",
        variant: "destructive",
      });
      return;
    }
    
    setTripPlan(prev => ({
      ...prev,
      locations: [
        ...prev.locations, 
        { 
          id: location.id, 
          name: location.name,
          order: prev.locations.length
        }
      ]
    }));
    
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
          <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
            <TabsTrigger value="plan">Plan New Trip</TabsTrigger>
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
                
                <Card className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-lg">Selected Locations</h2>
                    <span className="text-sm text-muted-foreground">{tripPlan.locations.length} locations</span>
                  </div>
                  
                  <ScrollArea className="h-[200px] pr-4">
                    {tripPlan.locations.length > 0 ? (
                      <div className="space-y-2">
                        {tripPlan.locations.map((location, index) => (
                          <div key={location.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                            <div className="flex items-center">
                              <div className="bg-primary/10 rounded-full p-1 mr-2">
                                <span className="w-5 h-5 flex items-center justify-center font-medium text-xs">
                                  {index + 1}
                                </span>
                              </div>
                              <span className="truncate max-w-[180px]">{location.name}</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveLocation(location.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground">
                        <MapPin className="h-8 w-8 mb-2" />
                        <p>Click on locations in the map to add them to your trip</p>
                      </div>
                    )}
                  </ScrollArea>
                  
                  <Separator className="my-4" />
                  
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
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Label className="flex items-center mr-2">Filter by region:</Label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All regions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All regions</SelectItem>
                        {regions.map(region => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Map onLocationSelect={handleAddLocation} />
                </Card>
              </div>
            </div>
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
    </div>
  );
};

export default TripPlanner;
