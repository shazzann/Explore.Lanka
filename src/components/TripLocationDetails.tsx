import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Star, Plus, X, Navigation } from "lucide-react";
import { Location } from '@/components/LocationCard';

interface TripLocationDetailsProps {
  location: Location | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToTrip: (location: Location) => void;
  isInTrip?: boolean;
}

const TripLocationDetails: React.FC<TripLocationDetailsProps> = ({
  location,
  isOpen,
  onClose,
  onAddToTrip,
  isInTrip = false
}) => {
  if (!isOpen || !location) return null;

  const estimatedVisitTime = getEstimatedVisitTime(location.category);
  const bestTimeToVisit = getBestTimeToVisit(location.category, location.region);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">{location.name}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-4 space-y-4">
            {location.image_url && (
              <div className="w-full h-48 rounded-lg overflow-hidden">
                <img
                  src={location.image_url}
                  alt={location.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{location.category}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{location.region}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Description</h3>
              <p className="text-muted-foreground">
                {location.description || location.short_description || "A beautiful location in Sri Lanka worth visiting."}
              </p>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">Estimated Visit Time</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">{estimatedVisitTime}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="font-medium">Best Time to Visit</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">{bestTimeToVisit}</p>
              </div>
            </div>
            
            {location.points && (
              <>
                <Separator />
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary text-primary">
                    {location.points} Points
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {location.unlocked ? "Already unlocked" : "Unlock by visiting"}
                  </span>
                </div>
              </>
            )}
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="font-semibold">Tips for Visiting</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                {getLocationTips(location.category).map((tip, index) => (
                  <p key={index}>• {tip}</p>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <Button
            className="w-full"
            onClick={() => onAddToTrip(location)}
            disabled={isInTrip}
          >
            {isInTrip ? (
              <>Already in Trip</>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add to Trip Plan
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Helper functions
function getEstimatedVisitTime(category: string): string {
  const timeMap: Record<string, string> = {
    'temple': '1-2 hours',
    'beach': '2-4 hours',
    'mountain': '3-6 hours',
    'city': '4-8 hours',
    'park': '2-4 hours',
    'museum': '1-3 hours',
    'waterfall': '2-3 hours',
    'historical': '1-2 hours',
    'cultural': '2-3 hours',
    'adventure': '4-8 hours',
    'wildlife': '3-5 hours'
  };
  
  return timeMap[category.toLowerCase()] || '2-3 hours';
}

function getBestTimeToVisit(category: string, region: string): string {
  const seasonMap: Record<string, string> = {
    'beach': 'December to March (dry season)',
    'mountain': 'December to March (clear weather)',
    'temple': 'Year-round (early morning recommended)',
    'cultural': 'Year-round (avoid midday heat)',
    'wildlife': 'December to March (animals more active)'
  };
  
  return seasonMap[category.toLowerCase()] || 'Year-round (check weather)';
}

function getLocationTips(category: string): string[] {
  const tipsMap: Record<string, string[]> = {
    'temple': [
      'Dress modestly (cover shoulders and knees)',
      'Remove shoes before entering',
      'Maintain silence and respect',
      'Early morning visits are less crowded'
    ],
    'beach': [
      'Bring sunscreen and stay hydrated',
      'Best visited early morning or late afternoon',
      'Check tide times for swimming',
      'Respect local customs'
    ],
    'mountain': [
      'Start early to avoid afternoon heat',
      'Bring layers for temperature changes',
      'Carry water and snacks',
      'Check weather conditions'
    ],
    'cultural': [
      'Learn about local customs beforehand',
      'Dress respectfully',
      'Consider hiring a local guide',
      'Allow plenty of time to explore'
    ]
  };
  
  return tipsMap[category.toLowerCase()] || [
    'Bring water and stay hydrated',
    'Check opening hours',
    'Respect local customs',
    'Plan for travel time'
  ];
}

export default TripLocationDetails;