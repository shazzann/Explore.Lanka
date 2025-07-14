import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { LockIcon, CheckIcon } from 'lucide-react';

export interface Location {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  region: string;
  category: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  unlocked?: boolean;
  points?: number;
  is_active?: boolean;
}

interface LocationCardProps {
  location: Location;
  onUnlock?: (locationId: string) => Promise<void>;
  isUnlockable?: boolean;
  compact?: boolean;
  className?: string;
}

const defaultImageUrl = "https://images.unsplash.com/photo-1554797589-7241bb691973?q=80&w=1000&auto=format&fit=crop";

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onUnlock,
  isUnlockable = false,
  compact = false,
  className = '',
}) => {
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = async () => {
    if (onUnlock && !isUnlocking) {
      setIsUnlocking(true);
      try {
        await onUnlock(location.id);
      } catch (error) {
        console.error('Error unlocking location:', error);
      } finally {
        setIsUnlocking(false);
      }
    }
  };

  const getBackgroundGradient = () => {
    if (!location.unlocked) {
      return 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.4) 100%)';
    }
    return 'linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 70%, transparent 100%)';
  };

  if (compact) {
    return (
      <Card className={`overflow-hidden group relative h-[200px] ${className}`}>
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${location.image_url || defaultImageUrl})` }}
        >
          <div className="absolute inset-0" style={{ background: getBackgroundGradient() }}></div>
        </div>
        <div className="absolute inset-0 z-10 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-lg line-clamp-1">
              {location.name}
            </h3>
            {!location.unlocked && (
              <div className="bg-black/70 rounded-full p-1">
                <LockIcon className="h-4 w-4 text-white" />
              </div>
            )}
            {location.unlocked && (
              <div className="bg-green-500/90 rounded-full p-1">
                <CheckIcon className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
          <div>
            <p className="text-white/80 text-sm line-clamp-2 mt-2">
              {location.short_description || location.description.substring(0, 60)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="bg-white/10 text-white border-none">
              {location.region}
            </Badge>
            {location.points && (
              <Badge variant="outline" className={`${location.unlocked ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white/10 text-white border-none'}`}>
                {location.points} points
              </Badge>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="relative">
        <AspectRatio ratio={16 / 9} className="bg-muted">
          <img
            src={location.image_url || defaultImageUrl}
            alt={location.name}
            className={`object-cover w-full h-full ${!location.unlocked ? 'filter brightness-50' : ''}`}
          />
        </AspectRatio>
        {!location.unlocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 rounded-full p-3">
              <LockIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        )}
        {location.points && (
          <div className="absolute top-2 right-2">
            <Badge variant={location.unlocked ? "default" : "outline"} className={location.unlocked ? "bg-green-100 text-green-700 border-green-200" : "bg-black/70 text-white"}>
              {location.points} points
            </Badge>
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {location.name}
              {!location.unlocked && <LockIcon className="h-4 w-4 text-muted-foreground" />}
              {location.unlocked && <CheckIcon className="h-4 w-4 text-green-500" />}
            </CardTitle>
            <CardDescription>{location.region} • {location.category}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className={`${!location.unlocked ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
          {!location.unlocked 
            ? "Visit this location to unlock its story and earn points!" 
            : location.description}
        </p>
      </CardContent>
      {!location.unlocked && isUnlockable && (
        <CardFooter>
          <Button 
            className="w-full"
            onClick={handleUnlock}
            disabled={isUnlocking}
          >
            {isUnlocking ? 'Unlocking...' : 'Visit to Unlock'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default LocationCard;
