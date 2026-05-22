ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS schedule_type TEXT DEFAULT 'fixed';
