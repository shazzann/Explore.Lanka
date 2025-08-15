-- Reset all likes and points, then recreate functions for 10 points per like

-- 1. Delete all existing photo likes
DELETE FROM public.photo_likes;

-- 2. Drop existing photo like triggers
DROP TRIGGER IF EXISTS on_photo_like_insert ON public.photo_likes;
DROP TRIGGER IF EXISTS on_photo_like_delete ON public.photo_likes;

-- 3. Recreate the photo like points function from scratch to award 10 points per like
CREATE OR REPLACE FUNCTION public.handle_photo_like_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  photo_owner_id uuid;
BEGIN
  -- Get the photo owner's user_id
  SELECT user_id INTO photo_owner_id
  FROM public.photos 
  WHERE id = COALESCE(NEW.photo_id, OLD.photo_id);
  
  -- Only proceed if we found a photo owner
  IF photo_owner_id IS NOT NULL THEN
    IF TG_OP = 'INSERT' THEN
      -- Add exactly 10 points for a new like
      UPDATE public.profiles 
      SET points = points + 10,
          updated_at = now()
      WHERE id = photo_owner_id;
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      -- Subtract exactly 10 points for removed like (but don't go below 0)
      UPDATE public.profiles 
      SET points = GREATEST(points - 10, 0),
          updated_at = now()
      WHERE id = photo_owner_id;
      RETURN OLD;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 4. Recreate the triggers for photo likes
CREATE TRIGGER on_photo_like_insert
  AFTER INSERT ON public.photo_likes
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_photo_like_points();

CREATE TRIGGER on_photo_like_delete
  AFTER DELETE ON public.photo_likes
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_photo_like_points();

-- 5. Reset all user points to be based only on location points (since all likes are deleted)
UPDATE public.profiles 
SET 
  points = COALESCE(location_stats.total_points, 0),
  places_unlocked = COALESCE(location_stats.total_places, 0),
  updated_at = now()
FROM (
  SELECT 
    user_id,
    SUM(points_earned) as total_points,
    COUNT(*) as total_places
  FROM public.user_locations
  GROUP BY user_id
) as location_stats
WHERE profiles.id = location_stats.user_id;

-- 6. Reset points and places to 0 for users with no unlocked locations
UPDATE public.profiles 
SET 
  points = 0,
  places_unlocked = 0,
  updated_at = now()
WHERE id NOT IN (
  SELECT DISTINCT user_id 
  FROM public.user_locations 
  WHERE user_id IS NOT NULL
);