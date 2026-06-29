DROP POLICY IF EXISTS "Update own friendship" ON public.friendships;

CREATE POLICY "Addressee updates friendship"
ON public.friendships
FOR UPDATE
TO authenticated
USING (auth.uid() = addressee_id)
WITH CHECK (auth.uid() = addressee_id);