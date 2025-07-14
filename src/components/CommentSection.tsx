import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username?: string;
  avatar_url?: string;
}

interface CommentSectionProps {
  photoId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ photoId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${photoId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `photo_id=eq.${photoId}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['comments', photoId] });
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [photoId, queryClient]);

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', photoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id (username, avatar_url)
        `)
        .eq('photo_id', photoId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map((comment: any) => ({
        ...comment,
        username: comment.profiles?.username || 'Anonymous',
        avatar_url: comment.profiles?.avatar_url || '/placeholder.svg'
      }));
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in to comment');
      if (!newComment.trim()) throw new Error('Comment cannot be empty');

      const { error } = await supabase
        .from('comments')
        .insert({
          photo_id: photoId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', photoId] });
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add comment',
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCommentMutation.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map((comment: Comment) => (
            <div key={comment.id} className="flex items-start gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={comment.avatar_url} />
                <AvatarFallback>{comment.username?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{comment.username}</span>{' '}
                  {comment.content}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No comments yet</p>
        )}
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[60px]"
          />
          <Button
            type="submit"
            size="sm"
            disabled={addCommentMutation.isPending || !newComment.trim()}
          >
            {addCommentMutation.isPending ? 'Posting...' : 'Post'}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          Please sign in to add comments
        </p>
      )}
    </div>
  );
};

export default CommentSection;