
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
    return translations[key]?.[language] || translations[key]?.pl || key;
  };
};

// Re-export types for convenience
export type { Language, Translations, TranslationObject } from './types';
