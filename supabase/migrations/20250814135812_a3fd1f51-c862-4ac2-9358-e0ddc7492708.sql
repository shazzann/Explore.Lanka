-- Check existing triggers and create only missing ones

-- First, let's check what triggers exist
DO $$
BEGIN
  -- Create photo like triggers if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_photo_like_insert') THEN
    CREATE TRIGGER on_photo_like_insert
      AFTER INSERT ON public.photo_likes
      FOR EACH ROW 
      EXECUTE FUNCTION public.handle_photo_like_points();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_photo_like_delete') THEN
    CREATE TRIGGER on_photo_like_delete
      AFTER DELETE ON public.photo_likes
      FOR EACH ROW 
      EXECUTE FUNCTION public.handle_photo_like_points();
  END IF;

  -- Create location triggers if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_location_points_change') THEN
    CREATE TRIGGER on_location_points_change
      AFTER UPDATE OF points ON public.locations
      FOR EACH ROW 
      EXECUTE FUNCTION public.handle_location_points_change();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_location_delete') THEN
    CREATE TRIGGER on_location_delete
      AFTER DELETE ON public.locations
      FOR EACH ROW 
      EXECUTE FUNCTION public.handle_location_points_change();
  END IF;

  -- Create comment trigger if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_photo_comments_updated_at') THEN
    CREATE TRIGGER update_photo_comments_updated_at
      BEFORE UPDATE ON public.photo_comments
      FOR EACH ROW 
      EXECUTE FUNCTION public.update_comment_updated_at();
  END IF;
END $$;