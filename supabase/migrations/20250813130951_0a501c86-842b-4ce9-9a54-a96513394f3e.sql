-- Ensure the trigger function exists and is correct
CREATE OR REPLACE FUNCTION public.handle_photo_like_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
      -- Add 1 point for a new like
      UPDATE public.profiles 
      SET points = points + 1,
          updated_at = now()
      WHERE id = photo_owner_id;
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      -- Subtract 1 point for removed like (but don't go below 0)
      UPDATE public.profiles 
      SET points = GREATEST(points - 1, 0),
          updated_at = now()
      WHERE id = photo_owner_id;
      RETURN OLD;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers to handle photo likes
CREATE OR REPLACE TRIGGER photo_like_points_trigger_insert
  AFTER INSERT ON public.photo_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_photo_like_points();

CREATE OR REPLACE TRIGGER photo_like_points_trigger_delete
  AFTER DELETE ON public.photo_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_photo_like_points();

-- Create a comprehensive sync function to fix any existing data inconsistencies
CREATE OR REPLACE FUNCTION public.sync_all_user_points()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update all users' points to be the sum of location points + photo like points
  UPDATE public.profiles 
  SET 
    points = COALESCE(location_points.total_location_points, 0) + COALESCE(like_points.total_like_points, 0),
    updated_at = now()
  FROM (
    -- Calculate location points for each user
    SELECT 
      user_id,
      SUM(points_earned) as total_location_points
    FROM public.user_locations
    GROUP BY user_id
  ) as location_points
  FULL OUTER JOIN (
    -- Calculate photo like points for each user
    SELECT 
      ph.user_id,
      COUNT(pl.id) as total_like_points
    FROM public.photos ph
    LEFT JOIN public.photo_likes pl ON pl.photo_id = ph.id
    GROUP BY ph.user_id
  ) as like_points ON location_points.user_id = like_points.user_id
  WHERE profiles.id = COALESCE(location_points.user_id, like_points.user_id);

  -- Reset points to 0 for users with no locations or likes
  UPDATE public.profiles 
  SET points = 0, updated_at = now()
  WHERE id NOT IN (
    SELECT COALESCE(ul.user_id, ph.user_id) 
    FROM user_locations ul 
    FULL OUTER JOIN photos ph ON ph.user_id = ul.user_id
    WHERE ul.user_id IS NOT NULL OR ph.user_id IS NOT NULL
  ) AND points > 0;
END;
$$;

-- Run the sync function to fix current data
SELECT public.sync_all_user_points();