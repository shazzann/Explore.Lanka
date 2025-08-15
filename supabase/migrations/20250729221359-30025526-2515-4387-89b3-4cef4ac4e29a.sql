-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, points, places_unlocked)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    0,
    0
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_profile_stats(user_id_param uuid, points_param integer, places_unlocked_param integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.sync_user_profile_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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