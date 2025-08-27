import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useProductTranslations = () => {
  const { toast } = useToast();

  const translateProductFields = useCallback(async (productId: string, productData: any) => {
    try {
      console.log('Starting automatic translation for product:', productId);
      
      const { data, error } = await supabase.functions.invoke('auto-translate', {
        body: {
          action: 'translate_product_fields',
          product_id: productId,
          product_data: {
            short_description: productData.shortDescription || '',
            initial_lift: productData.specs?.preliminaryLifting || '',
            condition: productData.specs?.condition || '',
            drive_type: productData.specs?.driveType || '',
            mast: productData.specs?.mast || '',
            wheels: productData.specs?.wheels || '',
            foldable_platform: productData.specs?.operatorPlatform || '',
            additional_options: productData.specs?.additionalOptions || '',
            detailed_description: productData.specs?.additionalDescription || ''
          }
        }
      });

      if (error) {
        console.error('Translation error:', error);
        throw error;
      }

      if (data.success) {
        console.log('Product translations completed:', data.results);
        
        const successCount = data.results.filter((r: any) => r.status === 'completed').length;
        const failureCount = data.results.filter((r: any) => r.status === 'failed').length;
        
        if (successCount > 0) {
          toast({
            title: "Tłumaczenia ukończone",
            description: `Przetłumaczono ${successCount} pól produktu automatycznie`,
            duration: 3000
          });
        }
        
        if (failureCount > 0) {
          toast({
            title: "Niektóre tłumaczenia nie powiodły się",
            description: `${failureCount} pól nie zostało przetłumaczonych`,
            variant: "destructive",
            duration: 5000
          });
        }
        
        return { success: true, results: data.results };
      }
      
      throw new Error(data.error || 'Translation failed');
      
    } catch (error) {
      console.error('Error in product translation:', error);
      
      // Nie pokazuj błędu automatycznych tłumaczeń użytkownikowi jeśli to nie jest krytyczne
      // toast({
      //   title: "Błąd tłumaczenia",
      //   description: "Nie udało się automatycznie przetłumaczyć produktu",
      //   variant: "destructive",
      //   duration: 3000
      // });
      
      return { success: false, error: error.message };
    }
  }, [toast]);

  const getProductTranslations = useCallback(async (productId: string, language: string) => {
    try {
      const { data, error } = await supabase
        .from('product_translations')
        .select('field_name, translated_value')
        .eq('product_id', productId)
        .eq('language', language);

      if (error) throw error;

      // Przekształć w obiekt field_name -> translated_value
      const translations = {};
      data?.forEach(item => {
        translations[item.field_name] = item.translated_value;
      });

      return translations;
    } catch (error) {
      console.error('Error fetching product translations:', error);
      return {};
    }
  }, []);

  return {
    translateProductFields,
    getProductTranslations
  };
};