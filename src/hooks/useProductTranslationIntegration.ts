import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAutoTranslation } from './useAutoTranslation';

export const useProductTranslationIntegration = () => {
  const { scheduleProductTranslation } = useAutoTranslation();

  useEffect(() => {
    // Listen for new products being inserted
    const channel = supabase
      .channel('product-translations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'products'
        },
        async (payload) => {
          console.log('New product detected, scheduling translation:', payload.new);
          
          // POPRAWKA: Automatyczne tłumaczenie dla nowego produktu z płaską strukturą
          try {
            const { data, error } = await supabase.functions.invoke('auto-translate', {
              body: {
                action: 'translate_product_fields',
                product_id: payload.new.id,
                // Dane bezpośrednio (bez wrapper)
                short_description: payload.new.short_description || '',
                detailed_description: payload.new.detailed_description || '',
                initial_lift: payload.new.initial_lift || '',
                condition: payload.new.condition || '',
                drive_type: payload.new.drive_type || '',
                mast: payload.new.mast || '',
                wheels: payload.new.wheels || '',
                foldable_platform: payload.new.foldable_platform || '',
                additional_options: payload.new.additional_options || ''
              }
            });

            if (error) {
              console.error('🚨 Błąd automatycznego tłumaczenia nowego produktu:', error);
            } else {
              console.log('✅ Automatyczne tłumaczenie nowego produktu uruchomione:', data);
            }
          } catch (error) {
            console.error('🚨 Krytyczny błąd tłumaczenia nowego produktu:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scheduleProductTranslation]);

  return {
    // This hook primarily sets up the real-time listener
    // You could expose additional functionality here if needed
  };
};