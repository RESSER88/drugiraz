
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useLanguage, Language } from '@/contexts/LanguageContext';

const languageFlags: Record<Language, { flag: string, name: string }> = {
  pl: { flag: '🇵🇱', name: 'Polski' },
  en: { flag: '🇬🇧', name: 'English' },
  cs: { flag: '🇨🇿', name: 'Čeština' },
  sk: { flag: '🇸🇰', name: 'Slovenčina' },
  de: { flag: '🇩🇪', name: 'Deutsch' }
};

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectLanguage = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="px-2 hover:bg-transparent hover:text-toyota-red"
          aria-label="Select language"
        >
          <span className="text-xl">{languageFlags[language].flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white shadow-md">
        {Object.entries(languageFlags).map(([lang, { flag, name }]) => (
          <DropdownMenuItem 
            key={lang}
            onClick={() => handleSelectLanguage(lang as Language)}
            className={`cursor-pointer ${lang === language ? 'bg-muted' : ''}`}
          >
            <span className="mr-2 text-lg">{flag}</span>
            <span>{name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
