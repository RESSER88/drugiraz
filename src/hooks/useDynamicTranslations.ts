import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Language } from '@/contexts/LanguageContext';

interface TranslationResult {
  content_id: string;
  content_type: string;
  source_language: string;
  target_language: string;
  source_content: string;
  translated_content: string;
  status: string;
}

export const useDynamicTranslations = (language: Language) => {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const loadTranslations = async () => {
    if (language === 'pl') {
      setTranslations({});
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('translation_jobs')
        .select('*')
        .eq('target_language', language)
        .eq('status', 'completed');

      if (error) throw error;

      const translationMap: Record<string, string> = {};
      
      data?.forEach((item: TranslationResult) => {
        // Create key from content_type + content_id + source_content
        const key = `${item.content_type}_${item.content_id}_${item.source_content}`;
        translationMap[key] = item.translated_content;
      });

      setTranslations(translationMap);
    } catch (error) {
      console.error('Error loading dynamic translations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTranslations();
  }, [language]);

  const getTranslation = (contentType: string, contentId: string, originalText: string): string => {
    if (language === 'pl') return originalText;
    
    const key = `${contentType}_${contentId}_${originalText}`;
    return translations[key] || originalText;
  };

  return {
    getTranslation,
    loading,
    refresh: loadTranslations
  };
};