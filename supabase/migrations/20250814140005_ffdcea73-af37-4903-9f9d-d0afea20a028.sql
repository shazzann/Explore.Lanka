-- Fix the leaderboard by clearing all likes and syncing points correctly

-- First, delete all photo likes to ensure clean state
DELETE FROM public.photo_likes;

-- Sync all user points to exactly match their location points
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

-- Reset points and places to 0 for users with no unlocked locations
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