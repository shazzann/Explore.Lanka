-- Reset photo likes and recalculate points correctly
-- First, let's clean up duplicate point activities that may have been created due to the duplicate triggers
DELETE FROM point_activities 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, activity_type, photo_id, created_at) id 
  FROM point_activities 
  WHERE activity_type IN ('photo_like_received', 'photo_like_removed')
  ORDER BY user_id, activity_type, photo_id, created_at, id
);

-- Now let's recalculate all user points to be accurate
-- Reset all points to 0 first
UPDATE profiles SET points = 0;

-- Add points from location unlocks
UPDATE profiles 
SET points = points + COALESCE(location_points.total_points, 0)
FROM (
  SELECT 
    user_id,
    SUM(points_earned) as total_points
  FROM user_locations
  GROUP BY user_id
) as location_points
WHERE profiles.id = location_points.user_id;

-- Add points from photo likes (1 point per like received)
UPDATE profiles 
SET points = points + COALESCE(like_points.total_likes, 0)
FROM (
  SELECT 
    p.user_id,
    COUNT(pl.id) as total_likes
  FROM photos p
  LEFT JOIN photo_likes pl ON pl.photo_id = p.id
  GROUP BY p.user_id
) as like_points
WHERE profiles.id = like_points.user_id;