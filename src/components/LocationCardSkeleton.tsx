import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const LocationCardSkeleton: React.FC = () => {
  return (
    <div className="gradient-card border border-border/50 rounded-lg p-4 hover-lift">
      <div className="relative mb-4">
        <Skeleton className="w-full h-48 rounded-md" />
        <div className="absolute top-2 right-2">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default LocationCardSkeleton;