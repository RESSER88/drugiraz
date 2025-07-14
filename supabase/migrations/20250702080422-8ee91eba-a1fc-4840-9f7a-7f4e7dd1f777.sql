
-- Tabela do trackingu opublikowanych produktów na różnych platformach
CREATE TABLE public.social_media_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('telegram', 'instagram', 'facebook', 'tiktok')),
  post_id TEXT, -- opcjonalne ID posta z platformy
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, platform) -- jeden produkt = jeden post na platformę
);

-- Włączenie Row Level Security
ALTER TABLE public.social_media_posts ENABLE ROW LEVEL SECURITY;

-- Policy dla service_role (Make.com z service_role key)
CREATE POLICY "Service role can manage social media posts" 
ON public.social_media_posts 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Policy dla odczytu publicznego (opcjonalne dla monitoringu)
CREATE POLICY "Anyone can read social media posts" 
ON public.social_media_posts 
FOR SELECT 
USING (true);

-- Funkcja RPC zwracająca losowy nieopublikowany produkt z pełnymi danymi
CREATE OR REPLACE FUNCTION public.get_unposted_product(platform_name TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'product', row_to_json(p.*),
        'images', COALESCE(array_agg(
            json_build_object(
                'id', pi.id,
                'image_url', pi.image_url,
                'alt_text', pi.alt_text,
                'display_order', pi.display_order
            ) ORDER BY pi.display_order
        ) FILTER (WHERE pi.id IS NOT NULL), '{}')
    )
    INTO result
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id
    WHERE p.id NOT IN (
        SELECT product_id 
        FROM social_media_posts 
        WHERE platform = platform_name
    )
    AND EXISTS (
        SELECT 1 FROM product_images pi2 
        WHERE pi2.product_id = p.id
    )
    GROUP BY p.id, p.name, p.serial_number, p.short_description, 
             p.detailed_description, p.condition, p.production_year,
             p.working_hours, p.lift_height, p.lift_capacity_initial,
             p.lift_capacity_mast, p.free_lift, p.min_height,
             p.dimensions, p.drive_type, p.mast, p.wheels,
             p.foldable_platform, p.battery, p.initial_lift,
             p.additional_options, p.image_url, p.created_at, p.updated_at
    ORDER BY RANDOM()
    LIMIT 1;
    
    RETURN result;
END;
$$;

-- Funkcja RPC do logowania publikacji (idempotentna)
CREATE OR REPLACE FUNCTION public.log_social_post(
    product_uuid UUID,
    platform_name TEXT,
    external_post_id TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    INSERT INTO social_media_posts (product_id, platform, post_id)
    VALUES (product_uuid, platform_name, external_post_id)
    ON CONFLICT (product_id, platform) 
    DO UPDATE SET posted_at = now(), post_id = EXCLUDED.post_id
    RETURNING json_build_object(
        'success', true,
        'product_id', product_id,
        'platform', platform,
        'posted_at', posted_at
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Funkcja pomocnicza do monitoringu stanu rotacji
CREATE OR REPLACE FUNCTION public.get_rotation_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'stats', json_agg(
            json_build_object(
                'platform', platform,
                'posted_products', count,
                'total_products_with_images', (
                    SELECT COUNT(*) 
                    FROM products p 
                    WHERE EXISTS(
                        SELECT 1 FROM product_images pi 
                        WHERE pi.product_id = p.id
                    )
                ),
                'remaining_products', (
                    SELECT COUNT(*) 
                    FROM products p 
                    WHERE EXISTS(
                        SELECT 1 FROM product_images pi 
                        WHERE pi.product_id = p.id
                    )
                    AND p.id NOT IN (
                        SELECT product_id 
                        FROM social_media_posts smp 
                        WHERE smp.platform = stats.platform
                    )
                )
            )
        )
    )
    INTO result
    FROM (
        SELECT 
            platform,
            COUNT(*) as count
        FROM social_media_posts 
        GROUP BY platform
        
        UNION ALL
        
        SELECT 'telegram', 0 WHERE NOT EXISTS (SELECT 1 FROM social_media_posts WHERE platform = 'telegram')
        UNION ALL
        SELECT 'instagram', 0 WHERE NOT EXISTS (SELECT 1 FROM social_media_posts WHERE platform = 'instagram')
        UNION ALL
        SELECT 'facebook', 0 WHERE NOT EXISTS (SELECT 1 FROM social_media_posts WHERE platform = 'facebook')
        UNION ALL
        SELECT 'tiktok', 0 WHERE NOT EXISTS (SELECT 1 FROM social_media_posts WHERE platform = 'tiktok')
    ) stats;
    
    RETURN result;
END;
$$;

-- Opcjonalna funkcja do resetowania rotacji (np. raz na rok)
CREATE OR REPLACE FUNCTION public.reset_platform_rotation(platform_name TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
    result JSON;
BEGIN
    DELETE FROM social_media_posts 
    WHERE platform = platform_name;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    SELECT json_build_object(
        'success', true,
        'platform', platform_name,
        'deleted_posts', deleted_count,
        'reset_at', now()
    ) INTO result;
    
    RETURN result;
END;
$$;
