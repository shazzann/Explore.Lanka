import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoPost {
  id: string;
  image_url: string;
  caption?: string;
  likes_count: number;
  comments_count: number;
  userName: string;
  userAvatar: string;
  date: string;
  locationName?: string;
  user_has_liked?: boolean;
}

interface EnhancedPhotoCardProps {
  post: PhotoPost;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  className?: string;
}

const EnhancedPhotoCard: React.FC<EnhancedPhotoCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  className
}) => {
  const [isLiked, setIsLiked] = React.useState(post.user_has_liked || false);
  const [likeCount, setLikeCount] = React.useState(post.likes_count);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.(post.id);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: { opacity: 1, scale: 1 }
  };

  const heartVariants = {
    initial: { scale: 1 },
    animate: { scale: [1, 1.3, 1] }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={cn('group', className)}
    >
      <Card className="overflow-hidden border-border/50 hover-lift gradient-card">
        {/* Header */}
        <CardContent className="p-4 pb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border border-border/50">
              <AvatarImage src={post.userAvatar} alt={post.userName} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {post.userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{post.userName}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                {post.locationName && (
                  <>
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate">{post.locationName}</span>
                    <span className="mx-2">•</span>
                  </>
                )}
                <span>{post.date}</span>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Image */}
        <div className="relative overflow-hidden">
          <motion.img
            variants={imageVariants}
            initial="hidden"
            animate={imageLoaded ? "visible" : "hidden"}
            src={post.image_url}
            alt={post.caption || 'Photo'}
            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-700"
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        </div>

        {/* Actions and content */}
        <CardContent className="p-4 pt-3">
          {/* Action buttons */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <motion.button
                variants={heartVariants}
                animate={isLiked ? "animate" : "initial"}
                onClick={handleLike}
                className="flex items-center space-x-1 text-sm hover:text-primary transition-colors"
              >
                <Heart 
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isLiked ? 'fill-red-500 text-red-500' : 'hover:text-red-500'
                  )} 
                />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={likeCount}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {likeCount}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
              
              <button
                onClick={() => onComment?.(post.id)}
                className="flex items-center space-x-1 text-sm hover:text-primary transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span>{post.comments_count}</span>
              </button>
            </div>
            
            <button
              onClick={() => onShare?.(post.id)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          {/* Caption */}
          {post.caption && (
            <div className="text-sm">
              <span className="font-medium mr-2">{post.userName}</span>
              <span>{post.caption}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnhancedPhotoCard;