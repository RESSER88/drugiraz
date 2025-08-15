-- Create table for translation management and monitoring
CREATE TABLE IF NOT EXISTS public.translation_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL, -- 'faq', 'product', 'static'
  content_id TEXT NOT NULL, -- product id or 'faq' for FAQ content
  source_language CHAR(2) NOT NULL DEFAULT 'pl',
  target_language CHAR(2) NOT NULL,
  source_content TEXT NOT NULL,
  translated_content TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  characters_used INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for translation statistics and limits monitoring
CREATE TABLE IF NOT EXISTS public.translation_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month_year TEXT NOT NULL, -- format: 'YYYY-MM'
  characters_used INTEGER DEFAULT 0,
  characters_limit INTEGER DEFAULT 500000,
  api_calls INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(month_year)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_translation_jobs_status ON public.translation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_translation_jobs_content ON public.translation_jobs(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_translation_jobs_created ON public.translation_jobs(created_at);

-- Enable RLS
ALTER TABLE public.translation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for translation tables (admin only access)
CREATE POLICY "Only admins can access translation jobs" 
ON public.translation_jobs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can access translation stats" 
ON public.translation_stats 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_translation_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_translation_jobs_updated_at
BEFORE UPDATE ON public.translation_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_translation_jobs_updated_at();

CREATE TRIGGER update_translation_stats_updated_at
BEFORE UPDATE ON public.translation_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_translation_jobs_updated_at();