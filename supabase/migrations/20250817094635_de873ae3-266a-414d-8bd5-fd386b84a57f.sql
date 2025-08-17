-- Create a cron job to run every minute for faster translation processing
select cron.schedule(
  'process-translations-1min',
  '* * * * *', -- every minute
  $$
  select
    net.http_post(
        url:='https://peztqgfmmnxaaoapzpbw.supabase.co/functions/v1/translation-worker',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlenRxZ2ZtbW54YWFvYXB6cGJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDU3NDAsImV4cCI6MjA2NjAyMTc0MH0.wXaJlrVMbf1z2egXCpdQUxTLv_dM9bswaZkOt6fLr-g"}'::jsonb,
        body:='{"action": "process_pending"}'::jsonb
    ) as request_id;
  $$
);