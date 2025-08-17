import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export interface TranslatedContent {
  [key: string]: string; // language -> translated text
}

export interface FAQTranslation {
  content_id: string;
  question: TranslatedContent;
  answer: TranslatedContent;
}

export const useDynamicTranslations = () => {
  const [faqTranslations, setFaqTranslations] = useState<FAQTranslation[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const { language } = useLanguage();
  const { toast } = useToast();

  const loadFAQTranslations = async () => {
    console.log('🔍 Loading FAQ translations from database...');
    setLoading(true);
    
    try {
      // Fetch all completed FAQ translations
      const { data: jobs, error } = await supabase
        .from('translation_jobs')
        .select('*')
        .eq('content_type', 'faq')
        .eq('status', 'completed')
        .not('translated_content', 'is', null);

      if (error) throw error;

      console.log(`📊 Found ${jobs?.length || 0} completed FAQ translations`);

      // Group translations by content_id
      const groupedTranslations: { [key: string]: FAQTranslation } = {};

      jobs?.forEach(job => {
        const contentId = job.content_id;
        
        if (!groupedTranslations[contentId]) {
          groupedTranslations[contentId] = {
            content_id: contentId,
            question: {},
            answer: {}
          };
        }

        // Determine if this is a question or answer based on content_id pattern
        // Assume pattern like: "faq_1_question" or "faq_1_answer"
        const parts = contentId.split('_');
        const type = parts[parts.length - 1]; // "question" or "answer"
        
        if (type === 'question') {
          groupedTranslations[contentId].question[job.target_language] = job.translated_content;
        } else if (type === 'answer') {
          groupedTranslations[contentId].answer[job.target_language] = job.translated_content;
        }
      });

      const translationsArray = Object.values(groupedTranslations);
      setFaqTranslations(translationsArray);
      setLastFetched(new Date().toISOString());
      
      console.log(`✅ Processed ${translationsArray.length} FAQ translation groups`);

    } catch (error) {
      console.error('❌ Error loading FAQ translations:', error);
      toast({
        title: 'Błąd tłumaczeń',
        description: 'Nie udało się załadować tłumaczeń FAQ',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getFAQItem = (questionId: string, language: string = 'pl') => {
    console.log(`🔍 Looking for FAQ item: ${questionId} in language: ${language}`);
    
    // Find translation for this question
    const translation = faqTranslations.find(t => 
      t.content_id.includes(questionId) || 
      t.content_id.endsWith('_question')
    );

    if (translation) {
      const question = translation.question[language] || translation.question['pl'];
      const answer = translation.answer[language] || translation.answer['pl'];
      
      console.log(`✅ Found translation for ${questionId}:`, { question: question?.substring(0, 50) });
      
      return {
        question: question || `FAQ Question ${questionId}`,
        answer: answer || `FAQ Answer ${questionId}`
      };
    }

    console.log(`❌ No translation found for ${questionId} in ${language}`);
    return null;
  };

  const getAllFAQItems = (targetLanguage: string = 'pl') => {
    console.log(`🔍 Getting all FAQ items in language: ${targetLanguage}`);
    
    const items = faqTranslations.map(translation => {
      const question = translation.question[targetLanguage] || 
                      translation.question['pl'] || 
                      'Brak tłumaczenia pytania';
      
      const answer = translation.answer[targetLanguage] || 
                     translation.answer['pl'] || 
                     'Brak tłumaczenia odpowiedzi';

      return {
        question,
        answer,
        id: translation.content_id
      };
    }).filter(item => item.question !== 'Brak tłumaczenia pytania');

    console.log(`📋 Returning ${items.length} FAQ items for language ${targetLanguage}`);
    return items;
  };

  const refreshTranslations = async () => {
    console.log('🔄 Refreshing translations...');
    await loadFAQTranslations();
  };

  useEffect(() => {
    // Load translations when component mounts or language changes
    loadFAQTranslations();
  }, [language]);

  useEffect(() => {
    // Set up real-time listener for translation_jobs changes
    console.log('🔗 Setting up real-time listener for translation updates...');
    
    const channel = supabase
      .channel('translation-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'translation_jobs',
          filter: 'content_type=eq.faq'
        },
        (payload) => {
          console.log('📡 Translation job updated:', payload);
          // Refresh translations when any FAQ translation changes
          loadFAQTranslations();
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Cleaning up real-time listener');
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    faqTranslations,
    loading,
    lastFetched,
    getFAQItem,
    getAllFAQItems,
    refreshTranslations,
    hasTranslations: faqTranslations.length > 0
  };
};