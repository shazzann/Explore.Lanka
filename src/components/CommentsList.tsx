import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePhotoComments } from '@/hooks/use-photo-comments';
import { formatDistanceToNow } from 'date-fns';

interface CommentsListProps {
  photoId: string;
}

const CommentsList: React.FC<CommentsListProps> = ({ photoId }) => {
  const { user } = useAuth();
  const { comments, isLoading, addComment, deleteComment } = usePhotoComments(photoId);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    addComment.mutate(newComment);
    setNewComment('');
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment.mutate(commentId);
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading comments...</div>;
  }

  return (
    <div className="space-y-3">
      {comments.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2 text-sm">
              <Avatar className="h-6 w-6">
                <AvatarImage src={comment.profiles?.avatar_url} alt={comment.profiles?.username} />
                <AvatarFallback className="text-xs">
                  {comment.profiles?.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-xs">{comment.profiles?.username}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                  {user && user.id === comment.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <p className="text-sm">{comment.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {user ? (
        <form onSubmit={handleAddComment} className="flex gap-2">
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="text-sm"
            disabled={addComment.isPending}
          />
          <Button 
            type="submit" 
            size="sm" 
            disabled={!newComment.trim() || addComment.isPending}
          >
            Post
          </Button>
        </form>
      ) : (
        <p className="text-xs text-muted-foreground">Sign in to add a comment</p>
      )}
    </div>
  );
};

export default CommentsList;