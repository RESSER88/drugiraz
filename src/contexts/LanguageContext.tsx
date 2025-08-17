
import React, { createContext, useState, useContext, ReactNode } from 'react';

export type Language = 'pl' | 'en' | 'cs' | 'sk' | 'de';

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  translationRefreshKey: number;
  refreshTranslations: () => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('pl');
  const [translationRefreshKey, setTranslationRefreshKey] = useState(0);

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setTranslationRefreshKey(prev => prev + 1);
  };

  const refreshTranslations = () => {
    setTranslationRefreshKey(prev => prev + 1);
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage: handleSetLanguage,
      translationRefreshKey,
      refreshTranslations
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
