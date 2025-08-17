
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export type Language = 'pl' | 'en' | 'cs' | 'sk' | 'de';

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
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
  const [translationRefreshTrigger, setTranslationRefreshTrigger] = useState(0);

  const handleLanguageChange = (newLanguage: Language) => {
    console.log(`🌐 Language changing from ${language} to ${newLanguage}`);
    setLanguage(newLanguage);
    
    // Trigger translation refresh for all components
    setTranslationRefreshTrigger(prev => prev + 1);
  };

  const refreshTranslations = () => {
    console.log('🔄 Manual translation refresh triggered');
    setTranslationRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    console.log(`📡 LanguageContext: Language changed to ${language}, trigger: ${translationRefreshTrigger}`);
  }, [language, translationRefreshTrigger]);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage: handleLanguageChange, 
      refreshTranslations 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
