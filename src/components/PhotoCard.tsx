
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, MapPin, Edit, Trash2, ZoomIn, X } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePhotoLikes } from '@/hooks/use-photo-likes';
import CommentsList from './CommentsList';
import { Dialog, DialogContent } from "@/components/ui/dialog";


export interface PhotoPost {
  id: string;
  image_url: string;
  caption?: string;
  likes_count: number;
  created_at?: string;
  user_id?: string;
  location_id?: string;
  userName: string; 
  userAvatar: string;
  date: string;
  locationName?: string;
  user_has_liked?: boolean;
  comments_count?: number;
}

interface PhotoCardProps {
  post: PhotoPost;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ post }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { toggleLike } = usePhotoLikes();
  const [showComments, setShowComments] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const isOwner = user && user.id === post.user_id;

  const deletePhotoMutation = useMutation({
    mutationFn: async () => {
      if (!user || user.id !== post.user_id) {
        throw new Error('You can only delete your own photos');
      }

      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', post.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      toast({
        title: "Success",
        description: "Photo deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete photo",
        variant: "destructive",
      });
    }
  });

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like photos",
        variant: "destructive",
      });
      return;
    }
    
    toggleLike.mutate({ 
      photoId: post.id, 
      isLiked: post.user_has_liked || false 
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      deletePhotoMutation.mutate();
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.userAvatar} alt={post.userName} />
            <AvatarFallback>{post.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-sm">{post.userName}</p>
            <p className="text-xs text-muted-foreground">{post.date}</p>
          </div>
          {post.locationName && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3" /> {post.locationName}
            </Badge>
          )}
          {isOwner && (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={deletePhotoMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 relative group">
        <img
          src={post.image_url}
          alt="Photo"
          className="w-full h-60 object-cover cursor-pointer"
          loading="lazy"
          onClick={() => setShowFullImage(true)}
        />
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setShowFullImage(true)}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </CardContent>
      
      {/* Full Image Dialog */}
      <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none">
          <div className="relative w-full">
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute top-2 right-2 z-10" 
              onClick={() => setShowFullImage(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img 
              src={post.image_url} 
              alt="Photo" 
              className="w-full max-h-[80vh] object-contain" 
            />
          </div>
        </DialogContent>
      </Dialog>
      <CardFooter className="flex flex-col items-start p-4 gap-2">
        <div className="flex items-center gap-4 w-full">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-1 px-2 ${post.user_has_liked ? 'text-red-500' : ''}`}
            onClick={handleLike}
            disabled={toggleLike.isPending}
          >
            <Heart className={`h-4 w-4 ${post.user_has_liked ? 'fill-current' : ''}`} />
            <span>{post.likes_count}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1 px-2"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments_count || 0}</span>
          </Button>
        </div>
        {post.caption && (
          <p className="text-sm">
            <span className="font-medium">{post.userName}</span> {post.caption}
          </p>
        )}
        {showComments && (
          <div className="mt-4 pt-4 border-t">
            <CommentsList photoId={post.id} />
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PhotoCard;
