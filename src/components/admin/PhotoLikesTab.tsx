import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PhotoData {
  id: string;
  image_url: string;
  caption: string | null;
  user_id: string;
  location_id: string | null;
  created_at: string;
  likes_count: number;
  username: string;
  location_name: string | null;
}

const PhotoLikesTab = () => {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingLikes, setRemovingLikes] = useState<string | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('photos')
        .select(`
          id,
          image_url,
          caption,
          user_id,
          location_id,
          created_at,
          profiles!inner(username),
          locations(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get likes count for each photo
      const photosWithLikes = await Promise.all(
        data.map(async (photo) => {
          const { count } = await supabase
            .from('photo_likes')
            .select('*', { count: 'exact', head: true })
            .eq('photo_id', photo.id);

          return {
            id: photo.id,
            image_url: photo.image_url,
            caption: photo.caption,
            user_id: photo.user_id,
            location_id: photo.location_id,
            created_at: photo.created_at,
            likes_count: count || 0,
            username: photo.profiles?.username || 'Unknown User',
            location_name: photo.locations?.name || null
          };
        })
      );

      setPhotos(photosWithLikes);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast({
        title: "Error",
        description: "Failed to load photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeAllLikesFromPhoto = async (photoId: string) => {
    try {
      setRemovingLikes(photoId);
      
      // Get all likes for this photo to calculate points to deduct
      const { data: likes, error: likesError } = await supabase
        .from('photo_likes')
        .select('*')
        .eq('photo_id', photoId);

      if (likesError) throw likesError;

      if (likes.length === 0) {
        toast({
          title: "Info",
          description: "This photo has no likes to remove.",
        });
        return;
      }

      // Remove all likes from this photo
      const { error: deleteError } = await supabase
        .from('photo_likes')
        .delete()
        .eq('photo_id', photoId);

      if (deleteError) throw deleteError;

      toast({
        title: "Success",
        description: `Removed ${likes.length} likes from the photo. Points have been automatically adjusted.`,
      });

      // Refresh the photos list
      await fetchPhotos();
    } catch (error) {
      console.error('Error removing likes:', error);
      toast({
        title: "Error",
        description: "Failed to remove likes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRemovingLikes(null);
    }
  };

  const resetAllPhotoLikes = async () => {
    try {
      setIsLoading(true);
      
      // Count total likes to be removed
      const { count } = await supabase
        .from('photo_likes')
        .select('*', { count: 'exact', head: true });

      if (!count || count === 0) {
        toast({
          title: "Info",
          description: "There are no photo likes to remove.",
        });
        return;
      }

      // Remove all photo likes
      const { error } = await supabase
        .from('photo_likes')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all rows

      if (error) throw error;

      toast({
        title: "Success",
        description: `Reset all photo likes system. Removed ${count} total likes and adjusted all user points.`,
      });

      // Refresh the photos list
      await fetchPhotos();
    } catch (error) {
      console.error('Error resetting photo likes:', error);
      toast({
        title: "Error",
        description: "Failed to reset photo likes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p>Loading photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Photo Likes Management</CardTitle>
          <CardDescription>
            Manage photo likes and reset the points system when needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  Reset All Photo Likes
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset All Photo Likes</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove ALL photo likes from the entire system and automatically adjust all user points. 
                    This action cannot be undone. Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetAllPhotoLikes}>
                    Yes, Reset All Likes
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Caption</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Likes Count</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {photos.map((photo) => (
                  <TableRow key={photo.id}>
                    <TableCell>
                      <img
                        src={photo.image_url}
                        alt="Photo"
                        className="w-16 h-16 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate">{photo.caption || "No caption"}</p>
                    </TableCell>
                    <TableCell>{photo.username}</TableCell>
                    <TableCell>{photo.location_name || "No location"}</TableCell>
                    <TableCell>{photo.likes_count}</TableCell>
                    <TableCell>
                      {photo.likes_count > 0 && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={removingLikes === photo.id}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove All Likes
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove All Likes</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove all {photo.likes_count} likes from this photo and 
                                automatically deduct the corresponding points from the photo owner. 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => removeAllLikesFromPhoto(photo.id)}
                              >
                                Remove Likes
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {photos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No photos found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotoLikesTab;