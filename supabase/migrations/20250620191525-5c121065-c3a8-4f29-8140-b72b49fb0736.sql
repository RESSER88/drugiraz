
-- Tworzenie tabeli products
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  short_description TEXT,
  serial_number TEXT UNIQUE NOT NULL,
  production_year INTEGER,
  lift_capacity_mast DECIMAL,
  lift_capacity_initial DECIMAL,
  working_hours DECIMAL,
  lift_height DECIMAL,
  min_height DECIMAL,
  initial_lift TEXT,
  battery TEXT,
  condition TEXT,
  drive_type TEXT,
  mast TEXT,
  free_lift DECIMAL,
  dimensions TEXT,
  wheels TEXT,
  foldable_platform TEXT,
  additional_options TEXT,
  detailed_description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tworzenie tabeli product_images
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tworzenie indeksów dla wydajności
CREATE INDEX idx_products_serial_number ON public.products(serial_number);
CREATE INDEX idx_products_name ON public.products(name);
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_product_images_order ON public.product_images(product_id, display_order);

-- Funkcja automatycznego aktualizowania updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger dla automatycznego aktualizowania updated_at w tabeli products
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Włączenie Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Domyślnie brak dostępu - polityki będą dodane później dla administratorów
-- Polityki typu "deny all" - dostęp będzie przydzielany tylko administratorom

-- Polityka dla tabeli products - brak dostępu domyślnie
CREATE POLICY "No access by default" ON public.products
    FOR ALL USING (false);

-- Polityka dla tabeli product_images - brak dostępu domyślnie  
CREATE POLICY "No access by default" ON public.product_images
    FOR ALL USING (false);

-- Komentarze do dokumentacji
COMMENT ON TABLE public.products IS 'Tabela przechowująca informacje o produktach (wózkach widłowych)';
COMMENT ON TABLE public.product_images IS 'Tabela przechowująca dodatkowe zdjęcia produktów';
COMMENT ON COLUMN public.products.name IS 'Model produktu';
COMMENT ON COLUMN public.products.short_description IS 'Krótki opis produktu';
COMMENT ON COLUMN public.products.serial_number IS 'Unikalny numer seryjny produktu';
COMMENT ON COLUMN public.products.lift_capacity_mast IS 'Udźwig przy podnoszeniu masztu [kg]';
COMMENT ON COLUMN public.products.lift_capacity_initial IS 'Udźwig przy podnoszeniu wstępnym [kg]';
COMMENT ON COLUMN public.products.working_hours IS 'Godziny pracy [mh]';
COMMENT ON COLUMN public.products.lift_height IS 'Wysokość podnoszenia [mm]';
COMMENT ON COLUMN public.products.min_height IS 'Wysokość konstrukcyjna [mm]';
