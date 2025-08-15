
-- Create a function to safely increment profile stats
CREATE OR REPLACE FUNCTION increment_profile_stats(user_id UUID, points_to_add INTEGER, places_to_add INTEGER)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    points = COALESCE(points, 0) + points_to_add,
    places_unlocked = COALESCE(places_unlocked, 0) + places_to_add
  WHERE id = user_id;
END;
$$;
