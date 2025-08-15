-- Create point_activities table to track when points are earned
CREATE TABLE public.point_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL, -- 'location_unlock', 'photo_like_received', 'photo_like_removed'
  points_earned INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  location_id UUID, -- for location unlocks
  photo_id UUID, -- for photo likes
  related_user_id UUID -- for photo likes (who liked the photo)
);

-- Enable RLS
ALTER TABLE public.point_activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all point activities" 
ON public.point_activities 
FOR SELECT 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_point_activities_user_id ON public.point_activities(user_id);
CREATE INDEX idx_point_activities_created_at ON public.point_activities(created_at);
CREATE INDEX idx_point_activities_user_created ON public.point_activities(user_id, created_at);

-- Update the location unlock trigger to log point activities
CREATE OR REPLACE FUNCTION public.handle_location_unlock_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  location_points integer;
BEGIN
  -- Get the points for this location
  SELECT points INTO location_points
  FROM public.locations 
  WHERE id = NEW.location_id;
  
  -- Update user's total points and places unlocked
  UPDATE public.profiles 
  SET points = points + COALESCE(location_points, 0),
      places_unlocked = places_unlocked + 1,
      updated_at = now()
  WHERE id = NEW.user_id;
  
  -- Log the point activity
  INSERT INTO public.point_activities (
    user_id, 
    activity_type, 
    points_earned, 
    location_id
  ) VALUES (
    NEW.user_id,
    'location_unlock',
    COALESCE(location_points, 0),
    NEW.location_id
  );
  
  RETURN NEW;
END;
$function$;

-- Create trigger for location unlocks
DROP TRIGGER IF EXISTS trigger_location_unlock_points ON public.user_locations;
CREATE TRIGGER trigger_location_unlock_points
  AFTER INSERT ON public.user_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_location_unlock_points();

-- Update the photo like points trigger to log activities
CREATE OR REPLACE FUNCTION public.handle_photo_like_points_with_activity()
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
      -- Add 1 point for a new like
      UPDATE public.profiles 
      SET points = points + 1,
          updated_at = now()
      WHERE id = photo_owner_id;
      
      -- Log the point activity
      INSERT INTO public.point_activities (
        user_id, 
        activity_type, 
        points_earned, 
        photo_id,
        related_user_id
      ) VALUES (
        photo_owner_id,
        'photo_like_received',
        1,
        NEW.photo_id,
        NEW.user_id
      );
      
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      -- Subtract 1 point for removed like (but don't go below 0)
      UPDATE public.profiles 
      SET points = GREATEST(points - 1, 0),
          updated_at = now()
      WHERE id = photo_owner_id;
      
      -- Log the point activity (negative points)
      INSERT INTO public.point_activities (
        user_id, 
        activity_type, 
        points_earned, 
        photo_id,
        related_user_id
      ) VALUES (
        photo_owner_id,
        'photo_like_removed',
        -1,
        OLD.photo_id,
        OLD.user_id
      );
      
      RETURN OLD;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Replace the existing photo like trigger
DROP TRIGGER IF EXISTS trigger_photo_like_points ON public.photo_likes;
CREATE TRIGGER trigger_photo_like_points
  AFTER INSERT OR DELETE ON public.photo_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_photo_like_points_with_activity();

-- Populate point_activities with existing data
-- For existing location unlocks
INSERT INTO public.point_activities (user_id, activity_type, points_earned, location_id, created_at)
SELECT 
  ul.user_id,
  'location_unlock',
  COALESCE(ul.points_earned, 0),
  ul.location_id,
  ul.unlocked_at
FROM public.user_locations ul
WHERE ul.unlocked_at IS NOT NULL;

-- For existing photo likes (approximate with photo creation date since we don't have like dates)
INSERT INTO public.point_activities (user_id, activity_type, points_earned, photo_id, related_user_id, created_at)
SELECT 
  ph.user_id,
  'photo_like_received',
  1,
  pl.photo_id,
  pl.user_id,
  pl.created_at
FROM public.photo_likes pl
JOIN public.photos ph ON ph.id = pl.photo_id;