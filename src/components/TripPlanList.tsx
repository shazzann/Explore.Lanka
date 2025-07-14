
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useTripPlans } from '@/hooks/use-trip-plans';
import { CalendarIcon, MapPinIcon, TrashIcon } from "lucide-react";
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
              <div className="flex items-center text-xs text-muted-foreground">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {trip.start_date ? format(new Date(trip.start_date), "PPP") : "No start date"} 
                {trip.end_date && ` - ${format(new Date(trip.end_date), "PPP")}`}
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
                        <div key={loc.id} className="flex items-center p-2 bg-muted/50 rounded-md">
                          <div className="bg-primary/10 rounded-full p-1 mr-2">
                            <span className="w-5 h-5 flex items-center justify-center font-medium text-xs">
                              {index + 1}
                            </span>
                          </div>
                          <span className="text-sm">{loc.name}</span>
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
