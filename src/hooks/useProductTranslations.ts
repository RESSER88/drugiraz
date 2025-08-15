import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Language } from '@/contexts/LanguageContext';
import { Product } from '@/types';

interface TranslatedProduct extends Product {
  translatedName?: string;
  translatedShortDescription?: string;
  translatedDetailedDescription?: string;
}

export const useProductTranslations = (products: Product[], language: Language) => {
  const [translatedProducts, setTranslatedProducts] = useState<TranslatedProduct[]>(products);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (language === 'pl' || products.length === 0) {
      setTranslatedProducts(products);
      return;
    }

    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        const { data: jobs, error } = await supabase
          .from('translation_jobs')
          .select('content_id, translated_content')
          .eq('status', 'completed')
          .eq('target_language', language)
          .eq('content_type', 'product');

        if (error) throw error;

        const translationMap = new Map<string, string>();
        jobs?.forEach(job => {
          translationMap.set(job.content_id, job.translated_content || '');
        });

        const updatedProducts = products.map(product => {
          const nameKey = `${product.id}_name`;
          const shortDescKey = `${product.id}_shortDescription`;
          const detailedDescKey = `${product.id}_additionalDescription`;

          return {
            ...product,
            translatedName: translationMap.get(nameKey),
            translatedShortDescription: translationMap.get(shortDescKey),
            translatedDetailedDescription: translationMap.get(detailedDescKey)
          };
        });

        setTranslatedProducts(updatedProducts);
      } catch (error) {
        console.error('Error loading product translations:', error);
        setTranslatedProducts(products);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [products, language]);

  return { translatedProducts, isLoading };
};