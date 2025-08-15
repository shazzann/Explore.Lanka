-- Remove the old duplicate triggers on photo_likes table
DROP TRIGGER IF EXISTS photo_like_points_insert ON public.photo_likes;
DROP TRIGGER IF EXISTS photo_like_points_delete ON public.photo_likes;

-- The new trigger 'trigger_photo_like_points' should remain as it properly handles both insert and delete operations