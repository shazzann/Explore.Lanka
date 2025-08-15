-- First, let's update all users' points to include their photo likes
-- Jisfaaz: 400 (locations) + 2 (likes) = 402 ✓ (already correct)
-- Hussain: 300 (locations) + 2 (likes) = 302
-- Shazan18: 200 (locations) + 2 (likes) = 202

UPDATE public.profiles 
SET points = 302, updated_at = now() 
WHERE username = 'Hussain';

UPDATE public.profiles 
SET points = 202, updated_at = now() 
WHERE username = 'Shazan18';

-- Now let's recreate the trigger function to ensure it works properly
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
    END IF;
    
    IF TG_OP = 'DELETE' THEN
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