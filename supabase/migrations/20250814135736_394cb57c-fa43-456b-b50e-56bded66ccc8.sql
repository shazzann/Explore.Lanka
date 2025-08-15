-- Recreate all missing triggers that are essential for the application

-- 1. Trigger for handling new user registration (creates profile)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Trigger for photo likes (handles points for likes)
CREATE TRIGGER on_photo_like_insert
  AFTER INSERT ON public.photo_likes
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_photo_like_points();

CREATE TRIGGER on_photo_like_delete
  AFTER DELETE ON public.photo_likes
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_photo_like_points();

-- 3. Trigger for location points changes (handles location point updates)
CREATE TRIGGER on_location_points_change
  AFTER UPDATE OF points ON public.locations
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_location_points_change();

CREATE TRIGGER on_location_delete
  AFTER DELETE ON public.locations
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_location_points_change();

-- 4. Trigger for comment timestamps
CREATE TRIGGER update_photo_comments_updated_at
  BEFORE UPDATE ON public.photo_comments
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_comment_updated_at();