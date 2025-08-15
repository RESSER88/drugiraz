import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Language } from '@/contexts/LanguageContext';

interface DynamicTranslations {
  faq: Array<{
    question: string;
    answer: string;
    id: string;
  }>;
  products: Record<string, {
    name?: string;
    short_description?: string;
    detailed_description?: string;
  }>;
}

export const useDynamicTranslations = (language: Language) => {
  const [translations, setTranslations] = useState<DynamicTranslations>({
    faq: [],
    products: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTranslations = async () => {
      if (language === 'pl') {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const { data: jobs, error } = await supabase
          .from('translation_jobs')
          .select('content_type, content_id, translated_content')
          .eq('status', 'completed')
          .eq('target_language', language);

        if (error) throw error;

        const faqQuestions: Record<string, string> = {};
        const faqAnswers: Record<string, string> = {};
        const productTranslations: Record<string, any> = {};

        jobs?.forEach(job => {
          if (job.content_type === 'faq') {
            if (job.content_id.includes('_question')) {
              const faqId = job.content_id.replace('_question', '');
              faqQuestions[faqId] = job.translated_content || '';
            } else if (job.content_id.includes('_answer')) {
              const faqId = job.content_id.replace('_answer', '');
              faqAnswers[faqId] = job.translated_content || '';
            }
          } else if (job.content_type === 'product') {
            const [productId, field] = job.content_id.split('_');
            if (!productTranslations[productId]) {
              productTranslations[productId] = {};
            }
            productTranslations[productId][field] = job.translated_content || '';
          }
        });

        // Build FAQ array
        const faqItems = Object.keys(faqQuestions).map(faqId => ({
          id: faqId,
          question: faqQuestions[faqId] || '',
          answer: faqAnswers[faqId] || ''
        })).filter(item => item.question && item.answer);

        setTranslations({
          faq: faqItems,
          products: productTranslations
        });

        setError(null);
      } catch (err) {
        console.error('Error loading dynamic translations:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  return { translations, isLoading, error };
};