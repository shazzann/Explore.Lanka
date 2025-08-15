-- Create triggers for photo_likes table to handle points
CREATE TRIGGER handle_photo_like_insert
  AFTER INSERT ON public.photo_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_photo_like_points();

CREATE TRIGGER handle_photo_like_delete
  AFTER DELETE ON public.photo_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_photo_like_points();