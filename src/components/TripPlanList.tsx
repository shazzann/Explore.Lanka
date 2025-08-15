
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import { useTripPlans } from '@/hooks/use-trip-plans';
import { CalendarIcon, MapPinIcon, TrashIcon, ClockIcon } from "lucide-react";

import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

interface TripPlanListProps {
  userId: string;
}

const TripPlanList: React.FC<TripPlanListProps> = () => {
  const { tripPlans, isLoading, deleteTripPlan } = useTripPlans();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);

  // Calculate trip duration in days
  const getTripDuration = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return null;
    const days = differenceInDays(new Date(endDate), new Date(startDate)) + 1;
    return days;
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate travel time between two locations
  const calculateTravelTime = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    const averageSpeed = 40; // km/h average for Sri Lanka
    const timeHours = distance / averageSpeed;
    return Math.round(timeHours * 60 * 1.2); // Add 20% buffer and convert to minutes
  };

  // Calculate total travel time between locations
  const getTotalTravelTime = (locations: any[]) => {
    if (locations.length < 2) return 0;
    
    let totalTime = 0;
    for (let i = 0; i < locations.length - 1; i++) {
      const time = calculateTravelTime(
        locations[i].latitude,
        locations[i].longitude,
        locations[i + 1].latitude,
        locations[i + 1].longitude
      );
      totalTime += time;
    }
    return totalTime;
  };

  // Format time in hours and minutes
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p>Loading your trip plans...</p>
      </div>
    );
  }

  if (tripPlans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-4">
          You don't have any saved trip plans yet.
        </p>
        <Button>Create Your First Trip</Button>
      </div>
    );
  }

  const handleDeleteTrip = (tripId: string) => {
    setTripToDelete(tripId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!tripToDelete) return;
    
    try {
      await deleteTripPlan.mutateAsync(tripToDelete);
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast({
        title: "Error",
        description: "Failed to delete trip plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setTripToDelete(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tripPlans.map((trip) => (
          <Card key={trip.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{trip.title}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDeleteTrip(trip.id)}
                >
                  <TrashIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-xs text-muted-foreground">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {trip.start_date ? format(new Date(trip.start_date), "PPP") : "No start date"} 
                  {trip.end_date && ` - ${format(new Date(trip.end_date), "PPP")}`}
                </div>
                {getTripDuration(trip.start_date, trip.end_date) && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getTripDuration(trip.start_date, trip.end_date)} days
                    </Badge>
                    {trip.locations.length > 1 && (
                      <Badge variant="outline" className="text-xs">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {formatTime(getTotalTravelTime(trip.locations))} travel
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              {trip.transportation && (
                <div className="mb-2 text-sm">
                  <span className="font-medium">Transportation:</span> {trip.transportation}
                </div>
              )}
              {trip.accommodation && (
                <div className="mb-2 text-sm">
                  <span className="font-medium">Accommodation:</span> {trip.accommodation}
                </div>
              )}
              
              <Separator className="my-3" />
              
              <div className="mb-2">
                <h4 className="text-sm font-medium mb-1">Locations:</h4>
                <ScrollArea className="h-[120px]">
                  {trip.locations.length > 0 ? (
                    <div className="space-y-2">
                      {trip.locations.map((loc, index) => (
                        <div key={loc.id} className="flex items-start p-2 bg-muted/50 rounded-md">
                          <div className="bg-primary/10 rounded-full p-1 mr-2 mt-0.5">
                            <span className="w-5 h-5 flex items-center justify-center font-medium text-xs">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{loc.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {loc.region} • {loc.category}
                            </div>
                            {index < trip.locations.length - 1 && (
                              <div className="text-xs text-muted-foreground mt-1 flex items-center">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                {formatTime(calculateTravelTime(
                                  loc.latitude,
                                  loc.longitude,
                                  trip.locations[index + 1].latitude,
                                  trip.locations[index + 1].longitude
                                ))} to next location
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-center p-4">
                      <p className="text-sm text-muted-foreground">No locations added</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
              
              {trip.notes && (
                <div className="mt-3 text-sm">
                  <h4 className="font-medium mb-1">Notes:</h4>
                  <p className="text-muted-foreground text-sm">{trip.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trip plan? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TripPlanList;
