import { useState } from 'react';
import { Button } from './button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';
import { Badge } from './badge';

const LanguageDebugger = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();
  const { translations, isLoading, error } = useDynamicTranslations(language);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-white shadow-lg"
        >
          🔍 Debug Lang
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Translation Debug</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsVisible(false)}
        >
          ✕
        </Button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">Current Language:</span> 
          <Badge variant="outline" className="ml-2">{language}</Badge>
        </div>
        
        <div>
          <span className="font-medium">Loading:</span> 
          <Badge variant={isLoading ? "destructive" : "default"} className="ml-2">
            {isLoading ? "YES" : "NO"}
          </Badge>
        </div>
        
        {error && (
          <div>
            <span className="font-medium text-red-600">Error:</span>
            <p className="text-red-600 text-xs">{error}</p>
          </div>
        )}
        
        <div>
          <span className="font-medium">FAQ Translations:</span> 
          <Badge variant="secondary" className="ml-2">
            {translations.faq.length}
          </Badge>
        </div>
        
        <div>
          <span className="font-medium">Product Translations:</span> 
          <Badge variant="secondary" className="ml-2">
            {Object.keys(translations.products).length}
          </Badge>
        </div>
        
        {translations.faq.length > 0 && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
            <p className="font-medium mb-1">Sample FAQ:</p>
            <p className="truncate">{translations.faq[0]?.question.slice(0, 50)}...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageDebugger;