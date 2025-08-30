-- P0: KRYTYCZNE - Zabezpieczenie danych klientów (price_inquiries RLS)
-- Poprawka po błędzie z extensions

-- Usuwamy zbyt permisywną politykę SELECT dla price_inquiries
DROP POLICY IF EXISTS "Anyone can insert price inquiries" ON public.price_inquiries;
DROP POLICY IF EXISTS "Only admins can select price inquiries" ON public.price_inquiries;
DROP POLICY IF EXISTS "Only admins can modify price inquiries" ON public.price_inquiries;
DROP POLICY IF EXISTS "Only admins can delete price inquiries" ON public.price_inquiries;

-- Tworzymy bezpieczne polityki RLS dla price_inquiries
CREATE POLICY "Public can submit price inquiries"
ON public.price_inquiries
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only admins can view price inquiries"
ON public.price_inquiries
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update price inquiries"
ON public.price_inquiries
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete price inquiries"
ON public.price_inquiries
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- P1: Dokończenie fix'ów search_path dla pozostałych funkcji
ALTER FUNCTION public.get_unposted_product_debug(text, boolean) SET search_path TO '';
ALTER FUNCTION public.get_rotation_stats() SET search_path TO '';
ALTER FUNCTION public.log_social_post(uuid, text, text) SET search_path TO '';
ALTER FUNCTION public.reset_platform_rotation(text) SET search_path TO '';

-- P1: Dodanie funkcji monitoringu dla produkcji
CREATE OR REPLACE FUNCTION public.health_check()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    result JSON;
    db_version TEXT;
    total_products INTEGER;
    total_inquiries INTEGER;
BEGIN
    -- Podstawowe informacje o zdrowiu systemu
    SELECT version() INTO db_version;
    
    SELECT COUNT(*) INTO total_products FROM public.products;
    SELECT COUNT(*) INTO total_inquiries FROM public.price_inquiries;
    
    SELECT json_build_object(
        'status', 'healthy',
        'timestamp', now(),
        'database_version', db_version,
        'products_count', total_products,
        'inquiries_count', total_inquiries,
        'uptime_check', true
    ) INTO result;
    
    RETURN result;
END;
$$;

-- P1: Funkcja sprawdzania bezpieczeństwa RLS
CREATE OR REPLACE FUNCTION public.security_audit()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    result JSON;
    rls_enabled_tables INTEGER;
    total_tables INTEGER;
BEGIN
    -- Sprawdzenie włączonego RLS
    SELECT COUNT(*) INTO rls_enabled_tables 
    FROM pg_class c 
    JOIN pg_namespace n ON c.relnamespace = n.oid 
    WHERE n.nspname = 'public' 
    AND c.relkind = 'r' 
    AND c.relrowsecurity = true;
    
    SELECT COUNT(*) INTO total_tables 
    FROM pg_class c 
    JOIN pg_namespace n ON c.relnamespace = n.oid 
    WHERE n.nspname = 'public' 
    AND c.relkind = 'r';
    
    SELECT json_build_object(
        'timestamp', now(),
        'rls_enabled_tables', rls_enabled_tables,
        'total_tables', total_tables,
        'rls_coverage_percent', ROUND((rls_enabled_tables::DECIMAL / total_tables * 100), 1),
        'security_status', 
        CASE 
            WHEN rls_enabled_tables = total_tables THEN 'secure'
            WHEN rls_enabled_tables >= total_tables * 0.8 THEN 'mostly_secure'
            ELSE 'needs_attention'
        END
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Dodanie indeksu dla lepszej wydajności price_inquiries
CREATE INDEX IF NOT EXISTS idx_price_inquiries_created_at ON public.price_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_inquiries_product_id ON public.price_inquiries(product_id) WHERE product_id IS NOT NULL;