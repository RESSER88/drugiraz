
import { Language, Translations } from './types';
import { navigationTranslations } from './navigation';
import { homepageTranslations } from './homepage';
import { productsTranslations } from './products';
import { productSpecsTranslations } from './productSpecs';
import { contactTranslations } from './contact';
import { commonTranslations } from './common';
import { formsTranslations } from './forms';
import { pricingTranslations } from './pricing';
import { adminTranslations } from './admin';
import { errorsTranslations } from './errors';
import { testimonialsTranslations } from './testimonials';
import { supabase } from '@/integrations/supabase/client';

// Cache for dynamic translations from database
let translationCache: Record<string, Record<Language, string>> = {};
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Load translations from database
const loadDynamicTranslations = async (): Promise<void> => {
  try {
    const { data: jobs, error } = await supabase
      .from('translation_jobs')
      .select('content_type, content_id, target_language, translated_content')
      .eq('status', 'completed');

    if (error) throw error;

    const newCache: Record<string, Record<Language, string>> = {};
    
    jobs?.forEach(job => {
      const key = `${job.content_type}_${job.content_id}`;
      if (!newCache[key]) {
        newCache[key] = {} as Record<Language, string>;
      }
      newCache[key][job.target_language as Language] = job.translated_content || '';
    });

    translationCache = newCache;
    lastCacheUpdate = Date.now();
    console.log(`Loaded ${Object.keys(newCache).length} dynamic translations`);
  } catch (error) {
    console.error('Error loading dynamic translations:', error);
  }
};

// Get dynamic translation
const getDynamicTranslation = async (key: string, language: Language): Promise<string | null> => {
  // Refresh cache if expired
  if (Date.now() - lastCacheUpdate > CACHE_DURATION) {
    await loadDynamicTranslations();
  }
  
  return translationCache[key]?.[language] || null;
};

// Aggregate all translations into a single object
export const translations: Translations = {
  ...navigationTranslations,
  ...homepageTranslations,
  ...productsTranslations,
  ...productSpecsTranslations,
  ...contactTranslations,
  ...commonTranslations,
  ...formsTranslations,
  ...pricingTranslations,
  ...adminTranslations,
  ...errorsTranslations,
  ...testimonialsTranslations
};

export type TranslationKey = keyof typeof translations;

export const useTranslation = (language: Language) => {
  return (key: TranslationKey): string => {
    // Try cached dynamic translations first
    const dynamicTranslation = translationCache[key]?.[language];
    if (dynamicTranslation) {
      return dynamicTranslation;
    }
    
    // Fallback to static translations
    return translations[key]?.[language] || translations[key]?.pl || key;
  };
};

// Synchronous version for immediate use
export const useTranslationSync = (language: Language) => {
  return (key: TranslationKey): string => {
    // Try cached dynamic translations first
    const dynamicTranslation = translationCache[key]?.[language];
    if (dynamicTranslation) {
      return dynamicTranslation;
    }
    
    // Fallback to static translations
    return translations[key]?.[language] || translations[key]?.pl || key;
  };
};

// Initialize cache on module load
loadDynamicTranslations();

// Re-export types for convenience
export type { Language, Translations, TranslationObject } from './types';
