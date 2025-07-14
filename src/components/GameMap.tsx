
import React, { useState } from 'react';
import { Location, mockLocations } from '@/data/mockData';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Navigation, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const GameMap: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const { toast } = useToast();
  
  const handleSimulateGPS = (location: Location) => {
    setSelectedLocation(location);
  };
  
  const handleUnlock = () => {
    if (!selectedLocation) return;
    
    toast({
      title: "Location Unlocked!",
      description: `You've unlocked ${selectedLocation.name} and earned ${selectedLocation.points} points!`,
      duration: 3000,
    });
    
    setSelectedLocation(null);
  };

  return (
    <div className="relative w-full h-[500px] md:h-[600px] animate-map-appear overflow-hidden rounded-xl border">
      <div className="absolute inset-0 bg-lanka-ivory">
        {/* This would be replaced with an actual map integration */}
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1536599424071-0b215a388ba7?q=80&w=2787&auto=format&fit=crop')] bg-cover bg-center opacity-80"></div>
        
        {/* Mock map locations */}
        <div className="absolute inset-0 p-4">
          {mockLocations.map((location) => (
            <div 
              key={location.id}
              className="absolute" 
              style={{ 
                left: `${20 + location.longitude * 2}%`, 
                top: `${10 + location.latitude * 5}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <button 
                className={`location-marker ${location.unlocked ? 'location-unlocked' : 'location-locked'}`}
                onClick={() => handleSimulateGPS(location)}
              >
                <MapPin className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
        
        {/* Map Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <Button size="icon" variant="secondary" className="rounded-full shadow-md">
            <Navigation className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" className="rounded-full shadow-md">
            <Compass className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Legend */}
        <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-lg shadow-md">
          <p className="font-medium text-sm">Map Legend</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="location-marker location-unlocked w-5 h-5">
              <MapPin className="h-3 w-3" />
            </div>
            <span className="text-xs">Unlocked Location</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="location-marker location-locked w-5 h-5">
              <MapPin className="h-3 w-3" />
            </div>
            <span className="text-xs">Locked Location</span>
          </div>
        </div>
      </div>

      {/* Location Dialog */}
      <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
        <DialogContent className="max-w-lg">
          {selectedLocation && (
            <>
              <DialogHeader>
                <DialogTitle className="flex justify-between items-center">
                  {selectedLocation.name}
                  <Badge variant="outline" className="bg-lanka-gold/10 text-lanka-orange">
                    {selectedLocation.points} pts
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  {selectedLocation.region} • {selectedLocation.category}
                </DialogDescription>
              </DialogHeader>
              
              <div className="relative h-48 w-full overflow-hidden rounded-md">
                <img 
                  src={selectedLocation.image} 
                  alt={selectedLocation.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-3">
                <p>{selectedLocation.description}</p>
                
                {selectedLocation.unlocked ? (
                  <div>
                    <h4 className="font-medium mb-2">Interesting Facts</h4>
                    <ul className="space-y-2">
                      {selectedLocation.facts.map((fact, index) => (
                        <li key={index} className="flex gap-2 text-sm">
                          <span>•</span>
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Button 
                    className="w-full mt-4 bg-lanka-orange hover:bg-lanka-orange/90"
                    onClick={handleUnlock}
                  >
                    Unlock This Location
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameMap;
