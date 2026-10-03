-- Optional column for future direct reaction storage
ALTER TABLE public.gifts ADD COLUMN IF NOT EXISTS reaction TEXT;
