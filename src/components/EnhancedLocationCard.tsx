import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Lock, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Location {
  id: string;
  name: string;
  description: string;
  region: string;
  category: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  unlocked: boolean;
  points: number;
  is_active: boolean;
}

interface EnhancedLocationCardProps {
  location: Location;
  onUnlock?: (locationId: string) => Promise<void>;
  isUnlockable?: boolean;
  compact?: boolean;
  className?: string;
}

const EnhancedLocationCard: React.FC<EnhancedLocationCardProps> = ({
  location,
  onUnlock,
  isUnlockable = false,
  compact = false,
  className
}) => {
  const [isUnlocking, setIsUnlocking] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const handleUnlock = async () => {
    if (!onUnlock) return;
    
    setIsUnlocking(true);
    try {
      await onUnlock(location.id);
    } finally {
      setIsUnlocking(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -8 }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={cn('group', className)}
    >
      <Card className={cn(
        'overflow-hidden border-border/50 transition-all duration-300',
        'hover:shadow-elegant hover:border-primary/20',
        location.unlocked 
          ? 'gradient-card' 
          : 'bg-background/50 backdrop-blur-sm',
        compact ? 'h-auto' : 'h-full'
      )}>
        <div className="relative overflow-hidden">
          <motion.img
            variants={imageVariants}
            initial="hidden"
            animate={imageLoaded ? "visible" : "hidden"}
            src={location.image_url || '/placeholder.svg'}
            alt={location.name}
            className={cn(
              'w-full object-cover transition-all duration-700',
              compact ? 'h-32' : 'h-48',
              'group-hover:scale-105'
            )}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          
          {/* Overlay gradient */}
          <div className={cn(
            'absolute inset-0 transition-opacity duration-300',
            location.unlocked 
              ? 'bg-gradient-to-t from-primary/20 to-transparent'
              : 'bg-gradient-to-t from-black/40 to-transparent'
          )} />
          
          {/* Status indicator */}
          <div className="absolute top-2 right-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
            >
              {location.unlocked ? (
                <Badge variant="secondary" className="bg-green-500/90 text-white border-0">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Unlocked
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-orange-500/90 text-white border-0">
                  <Lock className="h-3 w-3 mr-1" />
                  Locked
                </Badge>
              )}
            </motion.div>
          </div>

          {/* Points indicator */}
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="bg-background/90 border-border/50">
              {location.points} pts
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                {location.name}
              </h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {location.region}
              </div>
            </div>

            {!compact && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {location.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {location.category}
              </Badge>
              
              {!location.unlocked && isUnlockable && (
                <Button
                  onClick={handleUnlock}
                  disabled={isUnlocking}
                  size="sm"
                  className="hover-lift"
                >
                  {isUnlocking ? (
                    <>
                      <Clock className="h-4 w-4 mr-1 animate-spin" />
                      Unlocking...
                    </>
                  ) : (
                    'Unlock Location'
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnhancedLocationCard;