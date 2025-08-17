import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Language } from '@/contexts/LanguageContext';

interface ProductTranslation {
  product_id: string;
  target_language: string;
  field_name: string;
  translated_content: string;
}

export const useProductTranslations = (language: Language) => {
  const [productTranslations, setProductTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const loadProductTranslations = async () => {
    if (language === 'pl') {
      setProductTranslations({});
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('translation_jobs')
        .select('*')
        .eq('target_language', language)
        .eq('status', 'completed')
        .eq('content_type', 'product');

      if (error) throw error;

      const translationMap: Record<string, string> = {};
      
      data?.forEach((item: any) => {
        // Create key format: productId_fieldType_originalText
        const contentParts = item.content_id.split('_');
        if (contentParts.length >= 2) {
          const productId = contentParts[0];
          const fieldType = contentParts[1]; // model, shortDescription, additionalDescription
          const key = `${productId}_${fieldType}`;
          translationMap[key] = item.translated_content;
        }
      });

      setProductTranslations(translationMap);
    } catch (error) {
      console.error('Error loading product translations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductTranslations();
  }, [language]);

  const getProductTranslation = (productId: string, fieldType: 'model' | 'shortDescription' | 'additionalDescription', originalText: string): string => {
    if (language === 'pl') return originalText;
    
    const key = `${productId}_${fieldType}`;
    return productTranslations[key] || originalText;
  };

  return {
    getProductTranslation,
    loading,
    refresh: loadProductTranslations
  };
};