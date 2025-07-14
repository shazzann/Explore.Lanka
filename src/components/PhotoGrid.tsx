
import React from 'react';
import PhotoCard from '@/components/PhotoCard';

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
}

interface PhotoGridProps {
  photos: Photo[];
  isLoading: boolean;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center my-12">
        <p>Loading photos...</p>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No photos yet</h3>
        <p className="text-muted-foreground mt-1">Be the first to share a photo!</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          locationName: photo.location_name
        };

        return <PhotoCard key={photo.id} post={photoPost} />;
      })}
    </div>
  );
};

export default PhotoGrid;
