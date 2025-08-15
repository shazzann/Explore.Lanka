-- Drop any existing triggers first (just in case)
DROP TRIGGER IF EXISTS photo_like_points_insert ON public.photo_likes;
DROP TRIGGER IF EXISTS photo_like_points_delete ON public.photo_likes;

-- Create new triggers for photo_likes table
CREATE TRIGGER photo_like_points_insert
  AFTER INSERT ON public.photo_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_photo_like_points();

CREATE TRIGGER photo_like_points_delete
  AFTER DELETE ON public.photo_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_photo_like_points();