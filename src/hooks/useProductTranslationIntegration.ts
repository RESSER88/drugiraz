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
          
          // Schedule translation for the new product
          await scheduleProductTranslation(payload.new.id, {
            model: payload.new.name,
            shortDescription: payload.new.short_description,
            specs: {
              additionalDescription: payload.new.detailed_description
            }
          });
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