-- Drop triggers first, then function, then recreate with proper security
DROP TRIGGER IF EXISTS update_translation_jobs_updated_at ON public.translation_jobs;
DROP TRIGGER IF EXISTS update_translation_stats_updated_at ON public.translation_stats;
DROP FUNCTION IF EXISTS public.update_translation_jobs_updated_at();

-- Recreate function with proper security settings
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

-- Recreate triggers
CREATE TRIGGER update_translation_jobs_updated_at
BEFORE UPDATE ON public.translation_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_translation_jobs_updated_at();

CREATE TRIGGER update_translation_stats_updated_at
BEFORE UPDATE ON public.translation_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_translation_jobs_updated_at();