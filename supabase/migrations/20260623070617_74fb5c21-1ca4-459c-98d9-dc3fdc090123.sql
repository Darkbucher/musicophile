
-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Listener',
  avatar_url TEXT,
  invite_code TEXT NOT NULL UNIQUE DEFAULT lower(substring(md5(random()::text), 1, 8)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- FRIENDSHIPS
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;
GRANT ALL ON public.friendships TO service_role;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "See own friendships" ON public.friendships FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Create friendship as requester" ON public.friendships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Update own friendship" ON public.friendships FOR UPDATE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Delete own friendship" ON public.friendships FOR DELETE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Helper: are two users accepted friends?
CREATE OR REPLACE FUNCTION public.are_friends(_a UUID, _b UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
      AND ((requester_id = _a AND addressee_id = _b) OR (requester_id = _b AND addressee_id = _a))
  );
$$;

-- GIFTS
CREATE TABLE public.gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gift_date DATE NOT NULL,
  track_id TEXT,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  artwork_url TEXT,
  preview_url TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(recipient_id, gift_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gifts TO authenticated;
GRANT ALL ON public.gifts TO service_role;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

-- Recipient can see only gifts whose date has arrived (preserves surprise).
-- Sender can always see their own sent gifts (so they know what days they've booked).
CREATE POLICY "Sender sees own sent gifts" ON public.gifts FOR SELECT TO authenticated
  USING (auth.uid() = sender_id);
CREATE POLICY "Recipient sees due gifts" ON public.gifts FOR SELECT TO authenticated
  USING (auth.uid() = recipient_id AND gift_date <= (now() AT TIME ZONE 'utc')::date);

-- Anyone can check if a date is booked for any accepted friend (returns row existence, but only metadata via a separate RPC)
-- For UI: a SECURITY DEFINER function to list booked dates for a recipient (without leaking the song).
CREATE OR REPLACE FUNCTION public.booked_dates_for(_recipient UUID)
RETURNS TABLE(gift_date DATE) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT g.gift_date FROM public.gifts g
  WHERE g.recipient_id = _recipient
    AND g.gift_date >= (now() AT TIME ZONE 'utc')::date
    AND (
      auth.uid() = g.sender_id
      OR public.are_friends(auth.uid(), _recipient)
    );
$$;
GRANT EXECUTE ON FUNCTION public.booked_dates_for(UUID) TO authenticated;

CREATE POLICY "Insert gift to accepted friend in future" ON public.gifts FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND sender_id <> recipient_id
    AND gift_date > (now() AT TIME ZONE 'utc')::date
    AND public.are_friends(sender_id, recipient_id)
  );
CREATE POLICY "Sender can delete own future gifts" ON public.gifts FOR DELETE TO authenticated
  USING (auth.uid() = sender_id AND gift_date > (now() AT TIME ZONE 'utc')::date);

-- HISTORY
CREATE TABLE public.history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  played_date DATE NOT NULL,
  track_id TEXT,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  artwork_url TEXT,
  preview_url TEXT,
  source TEXT NOT NULL DEFAULT 'online' CHECK (source IN ('online','offline','gift')),
  gifter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, played_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.history TO authenticated;
GRANT ALL ON public.history TO service_role;
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own history readable" ON public.history FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.are_friends(auth.uid(), user_id));
CREATE POLICY "Insert own history" ON public.history FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own history" ON public.history FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Delete own history" ON public.history FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
