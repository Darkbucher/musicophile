GRANT EXECUTE ON FUNCTION public.are_friends(uuid, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.find_user_by_invite_code(text) TO authenticated;