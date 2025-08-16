import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Trash2, MessageSquare } from 'lucide-react';
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

interface CommentData {
  id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  photo_id: string;
  username: string;
  photo_caption: string | null;
  photo_image_url: string;
}

const PhotoCommentsTab = () => {
  const { toast } = useToast();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingComment, setRemovingComment] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('photo_comments')
        .select(`
          id,
          comment,
          created_at,
          updated_at,
          user_id,
          photo_id
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user and photo data separately
      const commentsWithUserData = await Promise.all(
        data.map(async (comment: any) => {
          // Get user data
          const { data: userData } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', comment.user_id)
            .single();

          // Get photo data
          const { data: photoData } = await supabase
            .from('photos')
            .select('caption, image_url')
            .eq('id', comment.photo_id)
            .single();

          return {
            id: comment.id,
            comment: comment.comment,
            created_at: comment.created_at,
            updated_at: comment.updated_at,
            user_id: comment.user_id,
            photo_id: comment.photo_id,
            username: userData?.username || 'Unknown User',
            photo_caption: photoData?.caption,
            photo_image_url: photoData?.image_url
          };
        })
      );

      setComments(commentsWithUserData);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeComment = async (commentId: string) => {
    try {
      setRemovingComment(commentId);
      
      const { error } = await supabase
        .from('photo_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment removed successfully.",
      });

      // Refresh the comments list
      await fetchComments();
    } catch (error) {
      console.error('Error removing comment:', error);
      toast({
        title: "Error",
        description: "Failed to remove comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRemovingComment(null);
    }
  };

  const resetAllComments = async () => {
    try {
      setIsLoading(true);
      
      // Count total comments to be removed
      const { count } = await supabase
        .from('photo_comments')
        .select('*', { count: 'exact', head: true });

      if (!count || count === 0) {
        toast({
          title: "Info",
          description: "There are no comments to remove.",
        });
        return;
      }

      // Remove all comments
      const { error } = await supabase
        .from('photo_comments')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all rows

      if (error) throw error;

      toast({
        title: "Success",
        description: `Removed all ${count} comments from the system.`,
      });

      // Refresh the comments list
      await fetchComments();
    } catch (error) {
      console.error('Error resetting comments:', error);
      toast({
        title: "Error",
        description: "Failed to reset comments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p>Loading comments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Photo Comments Management
          </CardTitle>
          <CardDescription>
            Manage photo comments and moderate user interactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  Reset All Comments
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset All Comments</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove ALL comments from the entire system. 
                    This action cannot be undone. Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetAllComments}>
                    Yes, Remove All Comments
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
                  <TableHead>Comment</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={comment.photo_image_url}
                          alt="Photo"
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="max-w-xs">
                          <p className="text-sm text-muted-foreground truncate">
                            {comment.photo_caption || "No caption"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm break-words">{comment.comment}</p>
                    </TableCell>
                    <TableCell>{comment.username}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(comment.created_at)}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={removingComment === comment.id}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Comment</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove this comment. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeComment(comment.id)}
                            >
                              Remove Comment
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {comments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No comments found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotoCommentsTab;