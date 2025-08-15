-- Create function to delete user account and all associated data
CREATE OR REPLACE FUNCTION public.delete_user_account(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete all user-related data in the correct order
  DELETE FROM public.photo_comments WHERE user_id = user_id_param;
  DELETE FROM public.photo_likes WHERE user_id = user_id_param;
  DELETE FROM public.trip_locations WHERE trip_id IN (SELECT id FROM public.trip_plans WHERE user_id = user_id_param);
  DELETE FROM public.trip_plans WHERE user_id = user_id_param;
  DELETE FROM public.photos WHERE user_id = user_id_param;
  DELETE FROM public.user_locations WHERE user_id = user_id_param;
  DELETE FROM public.hotel_visits WHERE user_id = user_id_param;
  DELETE FROM public.profiles WHERE id = user_id_param;
  
  -- Finally delete the auth user (this will trigger any remaining cascades)
  DELETE FROM auth.users WHERE id = user_id_param;
END;
$$;

-- Grant execute permission to authenticated users (they can only delete their own account)
GRANT EXECUTE ON FUNCTION public.delete_user_account(uuid) TO authenticated;