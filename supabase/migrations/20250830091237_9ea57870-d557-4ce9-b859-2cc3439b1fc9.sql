-- Fix function search_path security issues
ALTER FUNCTION public.get_unposted_product(text) SET search_path TO '';
ALTER FUNCTION public.get_unposted_product(text, boolean) SET search_path TO '';

-- Update auth configuration for better security
UPDATE auth.config SET 
  site_url = 'https://stakerpol.vercel.app',
  uri_allow_list = 'https://stakerpol.vercel.app',
  password_min_length = 8,
  password_require_lowercase = true,
  password_require_uppercase = true,
  password_require_numbers = true,
  password_require_symbols = false;