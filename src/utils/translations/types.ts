
export type Language = 'pl' | 'en' | 'cs' | 'sk' | 'de';

export type TranslationObject = Record<Language, string>;

export type Translations = Record<string, TranslationObject>;
