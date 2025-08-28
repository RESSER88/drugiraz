-- Clear the huge translation queue to start fresh
DELETE FROM translation_jobs;

-- Create table for managing dual DeepL API keys
CREATE TABLE public.deepl_api_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  api_key_encrypted text NOT NULL,
  api_key_masked text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  last_test_at timestamp with time zone,
  status text NOT NULL DEFAULT 'untested', -- 'active', 'error', 'quota_exceeded', 'untested'
  quota_limit integer DEFAULT 500000,
  quota_used integer DEFAULT 0,
  quota_remaining integer DEFAULT 500000,
  quota_reset_date timestamp with time zone,
  last_sync_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT unique_primary_key CHECK (
    NOT (is_primary = true AND id != (SELECT id FROM deepl_api_keys WHERE is_primary = true LIMIT 1))
  )
);

-- Enable RLS for deepl_api_keys
ALTER TABLE public.deepl_api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for deepl_api_keys
CREATE POLICY "Only admins can access deepl api keys" 
ON public.deepl_api_keys 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create detailed translation logs table
CREATE TABLE public.translation_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid,
  api_key_used text NOT NULL, -- masked key for identification
  translation_mode text NOT NULL, -- 'primary_only', 'fallback', 'sequential', 'parallel'
  field_name text NOT NULL,
  source_language text NOT NULL,
  target_language text NOT NULL,
  request_payload jsonb,
  response_payload jsonb,
  status text NOT NULL, -- 'success', 'error', 'quota_exceeded', 'retry'
  characters_used integer DEFAULT 0,
  error_details text,
  processing_time_ms integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for translation_logs
ALTER TABLE public.translation_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for translation_logs
CREATE POLICY "Only admins can access translation logs" 
ON public.translation_logs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add translation_mode column to existing translation_jobs for compatibility
ALTER TABLE public.translation_jobs 
ADD COLUMN IF NOT EXISTS translation_mode text DEFAULT 'fallback';

-- Create indexes for better performance
CREATE INDEX idx_translation_logs_product_id ON public.translation_logs(product_id);
CREATE INDEX idx_translation_logs_status ON public.translation_logs(status);
CREATE INDEX idx_translation_logs_created_at ON public.translation_logs(created_at DESC);
CREATE INDEX idx_deepl_api_keys_is_primary ON public.deepl_api_keys(is_primary, is_active);

-- Create trigger for updating updated_at on deepl_api_keys
CREATE TRIGGER update_deepl_api_keys_updated_at
  BEFORE UPDATE ON public.deepl_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();