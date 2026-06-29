
DROP TABLE IF EXISTS public.history CASCADE;
DROP FUNCTION IF EXISTS public.booked_dates_for(uuid) CASCADE;

ALTER TABLE public.gifts DROP CONSTRAINT IF EXISTS gifts_recipient_id_gift_date_key;
DROP POLICY IF EXISTS "Insert gift to accepted friend in future" ON public.gifts;
DROP POLICY IF EXISTS "Recipient sees due gifts" ON public.gifts;
DROP POLICY IF EXISTS "Sender can delete own future gifts" ON public.gifts;
DROP POLICY IF EXISTS "Sender sees own sent gifts" ON public.gifts;

ALTER TABLE public.gifts DROP COLUMN IF EXISTS gift_date;
ALTER TABLE public.gifts DROP COLUMN IF EXISTS preview_url;
ALTER TABLE public.gifts ADD COLUMN IF NOT EXISTS youtube_url text;
ALTER TABLE public.gifts ADD COLUMN IF NOT EXISTS youtube_video_id text;
ALTER TABLE public.gifts ADD COLUMN IF NOT EXISTS read_at timestamptz;

CREATE INDEX IF NOT EXISTS gifts_recipient_idx ON public.gifts(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS gifts_sender_idx ON public.gifts(sender_id, created_at DESC);

CREATE POLICY "Send gift to accepted friend"
  ON public.gifts FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND sender_id <> recipient_id
    AND public.are_friends(sender_id, recipient_id)
  );

CREATE POLICY "Recipient sees own received gifts"
  ON public.gifts FOR SELECT TO authenticated
  USING (auth.uid() = recipient_id);

CREATE POLICY "Sender sees own sent gifts"
  ON public.gifts FOR SELECT TO authenticated
  USING (auth.uid() = sender_id);

CREATE POLICY "Recipient marks gift as read"
  ON public.gifts FOR UPDATE TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Sender deletes own gift"
  ON public.gifts FOR DELETE TO authenticated
  USING (auth.uid() = sender_id);
