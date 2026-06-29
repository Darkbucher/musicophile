-- 1. Private invite_codes table
CREATE TABLE public.invite_codes (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE DEFAULT lower(substring(md5(random()::text), 1, 8)),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.invite_codes TO authenticated;
GRANT ALL ON public.invite_codes TO service_role;

ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner reads own invite code"
  ON public.invite_codes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owner inserts own invite code"
  ON public.invite_codes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2. Backfill from existing profiles
INSERT INTO public.invite_codes (user_id, code)
SELECT id, invite_code FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- 3. Drop the leaky column
ALTER TABLE public.profiles DROP COLUMN invite_code;

-- 4. Update new-user handler so a private invite code is created on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  INSERT INTO public.invite_codes (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 5. Safe lookup RPC — returns only the matching user id, nothing else
CREATE OR REPLACE FUNCTION public.find_user_by_invite_code(_code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.invite_codes WHERE code = lower(_code) LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.find_user_by_invite_code(text) TO authenticated;

-- 6. Prevent duplicate friendships in either direction
CREATE UNIQUE INDEX IF NOT EXISTS friendships_unique_pair
  ON public.friendships (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));

-- 7. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.gifts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;