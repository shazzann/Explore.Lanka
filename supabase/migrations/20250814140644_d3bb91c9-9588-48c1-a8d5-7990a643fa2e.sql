-- COMPLETELY FIX THE DUPLICATE TRIGGERS ISSUE

-- 1. Drop ALL existing triggers on photo_likes table
DROP TRIGGER IF EXISTS handle_photo_like_delete ON public.photo_likes;
DROP TRIGGER IF EXISTS handle_photo_like_insert ON public.photo_likes;
DROP TRIGGER IF EXISTS on_photo_like_delete ON public.photo_likes;
DROP TRIGGER IF EXISTS on_photo_like_insert ON public.photo_likes;
DROP TRIGGER IF EXISTS photo_like_points_delete ON public.photo_likes;
DROP TRIGGER IF EXISTS photo_like_points_insert ON public.photo_likes;
DROP TRIGGER IF EXISTS photo_like_points_trigger_delete ON public.photo_likes;
DROP TRIGGER IF EXISTS photo_like_points_trigger_insert ON public.photo_likes;
DROP TRIGGER IF EXISTS take_point_on_unlike ON public.photo_likes;

-- 2. Delete all existing likes to start fresh
DELETE FROM public.photo_likes;

-- 3. Reset all user points to location points only
UPDATE public.profiles 
SET 
  points = COALESCE(location_stats.total_points, 0),
  updated_at = now()
FROM (
  SELECT 
    user_id,
    SUM(points_earned) as total_points
  FROM public.user_locations
  GROUP BY user_id
) as location_stats
WHERE profiles.id = location_stats.user_id;

-- Reset to 0 for users with no locations
UPDATE public.profiles 
SET points = 0, updated_at = now()
WHERE id NOT IN (
  SELECT DISTINCT user_id 
  FROM public.user_locations 
  WHERE user_id IS NOT NULL
);

-- 4. Create ONLY TWO triggers - one for INSERT, one for DELETE
CREATE TRIGGER photo_like_points_insert
  AFTER INSERT ON public.photo_likes
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_photo_like_points();

CREATE TRIGGER photo_like_points_delete
  AFTER DELETE ON public.photo_likes
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_photo_like_points();