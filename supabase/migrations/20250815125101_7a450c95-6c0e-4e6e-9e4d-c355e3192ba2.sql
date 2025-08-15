-- Fix security warnings by setting search_path for functions
ALTER FUNCTION public.update_translation_jobs_updated_at() SET search_path = '';

-- Drop and recreate the function with proper security settings
DROP FUNCTION IF EXISTS public.update_translation_jobs_updated_at();

CREATE OR REPLACE FUNCTION public.update_translation_jobs_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;