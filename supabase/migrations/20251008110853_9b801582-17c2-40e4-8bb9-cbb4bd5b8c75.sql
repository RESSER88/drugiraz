-- Create product_seo_settings table for dynamic JSON-LD Product Schema configuration
CREATE TABLE IF NOT EXISTS public.product_seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  
  -- Pricing fields
  price NUMERIC(10, 2),
  price_currency TEXT DEFAULT 'PLN',
  price_valid_until DATE,
  
  -- Product identifiers
  gtin TEXT,
  mpn TEXT,
  
  -- Availability and condition
  availability TEXT DEFAULT 'InStock' CHECK (availability IN ('InStock', 'OutOfStock', 'PreOrder', 'Discontinued')),
  item_condition TEXT DEFAULT 'UsedCondition' CHECK (item_condition IN ('NewCondition', 'UsedCondition', 'RefurbishedCondition', 'DamagedCondition')),
  
  -- Schema control
  enable_schema BOOLEAN DEFAULT true,
  validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'valid', 'invalid')),
  validation_errors JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(product_id)
);

-- Enable RLS
ALTER TABLE public.product_seo_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view product SEO settings"
  ON public.product_seo_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert product SEO settings"
  ON public.product_seo_settings
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update product SEO settings"
  ON public.product_seo_settings
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete product SEO settings"
  ON public.product_seo_settings
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_product_seo_settings_updated_at
  BEFORE UPDATE ON public.product_seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster lookups
CREATE INDEX idx_product_seo_settings_product_id ON public.product_seo_settings(product_id);

COMMENT ON TABLE public.product_seo_settings IS 'SEO and structured data settings for products including pricing, availability, and JSON-LD schema configuration';