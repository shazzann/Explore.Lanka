
import React from 'react';
import PhotoCard from '@/components/PhotoCard';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Camera } from 'lucide-react';

interface Photo {
  id: string;
  image_url: string;
  caption?: string;
  created_at?: string;
  user_id?: string;
  location_id?: string;
  likes_count?: number;
  username?: string;
  avatar_url?: string;
  location_name?: string;
  user_has_liked?: boolean;
  comments_count?: number;
}

interface PhotoGridProps {
  photos: Photo[];
  isLoading: boolean;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="gradient-card rounded-lg border border-border/50 p-4 hover-lift">
            <Skeleton className="aspect-square w-full rounded-md mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <EmptyState
        icon={Camera}
        title="No Photos Yet"
        description="Share your travel moments and inspire other explorers!"
      />
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      {photos.map((photo) => {
        const photoPost = {
          id: photo.id,
          image_url: photo.image_url,
          caption: photo.caption,
          likes_count: photo.likes_count || 0,
          created_at: photo.created_at,
          user_id: photo.user_id,
          location_id: photo.location_id,
          userName: photo.username || 'Anonymous',
          userAvatar: photo.avatar_url || '/placeholder.svg',
          date: photo.created_at ? new Date(photo.created_at).toLocaleDateString() : '',
          locationName: photo.location_name,
          user_has_liked: photo.user_has_liked || false,
          comments_count: photo.comments_count || 0
        };

        return <PhotoCard key={photo.id} post={photoPost} />;
      })}
    </div>
  );
};

export default PhotoGrid;
