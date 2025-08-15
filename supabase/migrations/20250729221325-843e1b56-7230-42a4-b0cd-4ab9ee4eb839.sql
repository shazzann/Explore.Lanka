-- Sync profile points with actual earned points from user_locations table
-- This will fix the inconsistency where user_locations records don't match profile points

-- Create a function to recalculate and sync user stats
CREATE OR REPLACE FUNCTION public.sync_user_profile_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update all profiles with correct points and places_unlocked based on user_locations
  UPDATE public.profiles 
  SET 
    points = COALESCE(user_stats.total_points, 0),
    places_unlocked = COALESCE(user_stats.total_places, 0),
    updated_at = now()
  FROM (
    SELECT 
      user_id,
      SUM(points_earned) as total_points,
      COUNT(*) as total_places
    FROM public.user_locations
    GROUP BY user_id
  ) as user_stats
  WHERE profiles.id = user_stats.user_id;

  -- Set points and places_unlocked to 0 for users with no unlocked locations
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
END;
$$;

-- Execute the sync function to fix current data
SELECT public.sync_user_profile_stats();

-- Verify the results
SELECT 
  p.id,
  p.username,
  p.points as profile_points,
  p.places_unlocked as profile_places,
  COALESCE(ul.actual_points, 0) as actual_points,
  COALESCE(ul.actual_places, 0) as actual_places
FROM public.profiles p
LEFT JOIN (
  SELECT 
    user_id,
    SUM(points_earned) as actual_points,
    COUNT(*) as actual_places
  FROM public.user_locations
  GROUP BY user_id
) ul ON p.id = ul.user_id
ORDER BY p.points DESC;