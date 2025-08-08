-- Create table for price inquiries
CREATE TABLE IF NOT EXISTS public.price_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  product_id UUID,
  product_model TEXT NOT NULL,
  production_year TEXT,
  serial_number TEXT,
  phone TEXT,
  language TEXT NOT NULL,
  message TEXT,
  page_url TEXT,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.price_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public lead capture)
CREATE POLICY "Anyone can insert price inquiries"
  ON public.price_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Restrict SELECT to admins only
CREATE POLICY "Only admins can select price inquiries"
  ON public.price_inquiries
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Restrict UPDATE/DELETE to admins only
CREATE POLICY "Only admins can modify price inquiries"
  ON public.price_inquiries
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete price inquiries"
  ON public.price_inquiries
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_price_inquiries_created_at ON public.price_inquiries(created_at DESC);