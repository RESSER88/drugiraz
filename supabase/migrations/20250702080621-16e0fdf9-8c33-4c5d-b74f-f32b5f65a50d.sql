-- Zaktualizowana funkcja z automatycznym resetem rotacji
CREATE OR REPLACE FUNCTION public.get_unposted_product(
    platform_name TEXT,
    auto_reset BOOLEAN DEFAULT true
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    available_count INTEGER;
BEGIN
    -- Sprawdź czy są dostępne nieopublikowane produkty
    SELECT COUNT(*)
    INTO available_count
    FROM products p
    WHERE p.id NOT IN (
        SELECT product_id 
        FROM social_media_posts 
        WHERE platform = platform_name
    )
    AND EXISTS (
        SELECT 1 FROM product_images pi 
        WHERE pi.product_id = p.id
    );
    
    -- Jeśli nie ma dostępnych produktów i auto_reset jest włączony
    IF available_count = 0 AND auto_reset THEN
        -- Reset rotacji dla tej platformy
        DELETE FROM social_media_posts 
        WHERE platform = platform_name;
        
        -- Log automatycznego resetu
        RAISE NOTICE 'Auto-reset executed for platform: %', platform_name;
    END IF;
    
    -- Pobierz losowy nieopublikowany produkt z pełnymi danymi
    SELECT json_build_object(
        'product', row_to_json(p.*),
        'images', COALESCE(array_agg(
            json_build_object(
                'id', pi.id,
                'image_url', pi.image_url,
                'alt_text', pi.alt_text,
                'display_order', pi.display_order
            ) ORDER BY pi.display_order
        ) FILTER (WHERE pi.id IS NOT NULL), '{}'),
        'auto_reset_executed', (available_count = 0 AND auto_reset)
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

-- Zaktualizowana funkcja monitoringu z informacją o resetach
CREATE OR REPLACE FUNCTION public.get_rotation_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    total_products_with_images INTEGER;
BEGIN
    -- Pobierz całkowitą liczbę produktów z obrazami
    SELECT COUNT(*) 
    INTO total_products_with_images
    FROM products p 
    WHERE EXISTS(
        SELECT 1 FROM product_images pi 
        WHERE pi.product_id = p.id
    );
    
    SELECT json_build_object(
        'total_products_with_images', total_products_with_images,
        'stats', json_agg(
            json_build_object(
                'platform', platform,
                'posted_products', count,
                'remaining_products', (
                    total_products_with_images - count
                ),
                'rotation_progress_percent', 
                CASE 
                    WHEN total_products_with_images > 0 
                    THEN ROUND((count::DECIMAL / total_products_with_images * 100), 1)
                    ELSE 0 
                END,
                'needs_reset', (count >= total_products_with_images)
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