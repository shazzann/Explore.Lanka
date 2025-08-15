-- Delete all existing photo likes to start fresh
DELETE FROM public.photo_likes;

-- Fix the photo like points trigger to give exactly 1 point per like
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
      -- Add exactly 1 point for a new like
      UPDATE public.profiles 
      SET points = points + 1,
          updated_at = now()
      WHERE id = photo_owner_id;
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      -- Subtract exactly 1 point for removed like (but don't go below 0)
      UPDATE public.profiles 
      SET points = GREATEST(points - 1, 0),
          updated_at = now()
      WHERE id = photo_owner_id;
      RETURN OLD;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Sync all user points to reset the leaderboard based on location points only (since all likes are deleted)
UPDATE public.profiles 
SET 
  points = COALESCE(location_points.total_location_points, 0),
  updated_at = now()
FROM (
  -- Calculate location points for each user
  SELECT 
    user_id,
    SUM(points_earned) as total_location_points
  FROM public.user_locations
  GROUP BY user_id
) as location_points
WHERE profiles.id = location_points.user_id;

-- Reset points to 0 for users with no unlocked locations
UPDATE public.profiles 
SET points = 0, updated_at = now()
WHERE id NOT IN (
  SELECT DISTINCT user_id 
  FROM user_locations 
  WHERE user_id IS NOT NULL
) AND points > 0;