-- Enable cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable http extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS http;

-- Schedule translation worker to run every minute
SELECT cron.schedule(
  'process-translations-every-minute',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://peztqgfmmnxaaoapzpbw.supabase.co/functions/v1/translation-worker',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlenRxZ2ZtbW54YWFvYXB6cGJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQ0NTc0MCwiZXhwIjoyMDY2MDIxNzQwfQ.8C4QNSVyabY4_Eg4wgDWwMRzjA5HZ5yXFHh2UMbCvOE"}'::jsonb,
    body := '{"source": "cron"}'::jsonb
  );
  $$
);