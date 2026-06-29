
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.are_friends(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.booked_dates_for(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.booked_dates_for(UUID) TO authenticated;
