-- Ensure unique slug generation via trigger, without changing UI
-- 1) Helper trigger function to set slug when missing
CREATE OR REPLACE FUNCTION public.set_product_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_product_slug(NEW.name, NEW.serial_number);
  END IF;
  RETURN NEW;
END;
$$;

-- 2) Create trigger on insert (and update when slug is cleared)
DROP TRIGGER IF EXISTS set_product_slug_on_products ON public.products;
CREATE TRIGGER set_product_slug_on_products
BEFORE INSERT ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.set_product_slug();

DROP TRIGGER IF EXISTS ensure_product_slug_on_update ON public.products;
CREATE TRIGGER ensure_product_slug_on_update
BEFORE UPDATE ON public.products
FOR EACH ROW
WHEN (NEW.slug IS NULL OR NEW.slug = '')
EXECUTE FUNCTION public.set_product_slug();

-- 3) Ensure unique constraint on slug if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'products_slug_unique' 
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
    ADD CONSTRAINT products_slug_unique UNIQUE (slug);
  END IF;
END $$;