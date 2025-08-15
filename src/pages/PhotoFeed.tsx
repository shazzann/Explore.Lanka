
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PhotoUpload from '@/components/PhotoUpload';
import PhotoGrid from '@/components/PhotoGrid';
import { usePhotos } from '@/hooks/use-photos';

const PhotoFeed = () => {
  const { photos, isLoading, error } = usePhotos();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container px-4 py-6 flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Photo Feed</h1>
          <PhotoUpload />
        </div>
        {error && (
          <div className="text-center text-red-500 mb-4">
            Failed to load photos: {error.message || "Unknown error"}
          </div>
        )}
        <PhotoGrid photos={photos} isLoading={isLoading} />
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default PhotoFeed;
