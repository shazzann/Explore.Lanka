
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, MapPin } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import CommentSection from './CommentSection';
import { cn } from '@/lib/utils';

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
}

interface PhotoCardProps {
  post: PhotoPost;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ post }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('Please sign in to like photos');
      }
      
      const newLikesCount = liked ? Math.max(likesCount - 1, 0) : likesCount + 1;
      
      const { error } = await supabase
        .from('photos')
        .update({ likes_count: newLikesCount })
        .eq('id', post.id);
      
      if (error) throw error;
      
      return newLikesCount;
    },
    onSuccess: (newLikesCount) => {
      setLiked(!liked);
      setLikesCount(newLikesCount);
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update like status",
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
    
    likeMutation.mutate();
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
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <img
          src={post.image_url}
          alt="Photo"
          className="w-full h-60 object-cover"
          loading="lazy"
        />
      </CardContent>
      <CardFooter className="flex flex-col items-start p-4 gap-2">
        <div className="flex items-center gap-4 w-full">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-1 px-2 ${liked ? 'text-red-500' : ''}`}
            onClick={handleLike}
            disabled={likeMutation.isPending}
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            <span>{likesCount}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("flex items-center gap-1 px-2", showComments && "text-primary")}
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            <span>Comment</span>
          </Button>
        </div>
        {post.caption && (
          <p className="text-sm">
            <span className="font-medium">{post.userName}</span> {post.caption}
          </p>
        )}
        {showComments && (
          <div className="w-full mt-2 border-t pt-2">
            <CommentSection photoId={post.id} />
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PhotoCard;
