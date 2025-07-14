
-- First, let's check if the function exists and create/update it with correct parameters
CREATE OR REPLACE FUNCTION public.increment_profile_stats(
  user_id_param UUID,
  points_param INTEGER,
  places_unlocked_param INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, points, places_unlocked)
  VALUES (user_id_param, points_param, places_unlocked_param)
  ON CONFLICT (id) 
  DO UPDATE SET 
    points = profiles.points + points_param,
    places_unlocked = profiles.places_unlocked + places_unlocked_param,
    updated_at = now();
END;
$$;
