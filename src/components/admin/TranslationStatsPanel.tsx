import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Languages, AlertCircle, RefreshCw } from 'lucide-react';
import { useAutoTranslation } from '@/hooks/useAutoTranslation';

interface TranslationStatsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const TranslationStatsPanel: React.FC<TranslationStatsProps> = ({ isOpen, onOpenChange }) => {
  const { stats, loading, refreshData, processPendingTranslations } = useAutoTranslation();

  const usagePercentage = stats ? (stats.characters_used / stats.characters_limit) * 100 : 0;
  const remainingCharacters = stats ? stats.characters_limit - stats.characters_used : 500000;

  const getLanguageName = (lang: string) => {
    const names = {
      en: 'Angielski',
      cs: 'Czeski', 
      sk: 'Słowacki',
      de: 'Niemiecki'
    };
    return names[lang] || lang;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <Languages className="h-5 w-5 text-primary" />
          <div className="text-left">
            <h3 className="font-semibold">Tłumaczenia AI</h3>
            <p className="text-sm text-muted-foreground">
              Statystyki wykorzystania DeepL API i postęp tłumaczeń
            </p>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Wykorzystanie DeepL */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  DeepL Quota
                  {stats?.limit_reached && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={refreshData}
                  disabled={loading}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Pozostało znaków</span>
                  <span className={remainingCharacters < 50000 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                    {remainingCharacters.toLocaleString()}
                  </span>
                </div>
                
                {stats?.limit_reached && (
                  <div className="text-xs text-red-600 font-medium">
                    Limit miesięczny wyczerpany
                  </div>
                )}
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Wykorzystane</span>
                  <span>
                    {stats ? `${stats.characters_used.toLocaleString()} / ${stats.characters_limit.toLocaleString()}` : '0 / 500,000'}
                  </span>
                </div>
                
                <Progress value={usagePercentage} className="h-2" />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{usagePercentage.toFixed(1)}% wykorzystania</span>
                  <span>{stats?.api_calls || 0} wywołań API</span>
                </div>

                {remainingCharacters < 50000 && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    Uwaga: Pozostało mało znaków DeepL
                  </div>
                )}

                <Button 
                  onClick={processPendingTranslations}
                  disabled={loading}
                  size="sm"
                  className="w-full mt-3"
                >
                  {loading ? 'Przetwarzanie...' : 'Uruchom tłumaczenia'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Postęp tłumaczeń */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Postęp tłumaczeń produktów</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.translation_progress ? 
                  Object.entries(stats.translation_progress).map(([lang, progress]: [string, any]) => {
                    const percentage = progress.total_products > 0 
                      ? (progress.translated_products / progress.total_products) * 100 
                      : 0;
                    
                    return (
                      <div key={lang} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{getLanguageName(lang)}</span>
                          <span>{progress.translated_products}/{progress.total_products}</span>
                        </div>
                        <Progress value={percentage} className="h-1" />
                      </div>
                    );
                  })
                : (
                  <div className="text-sm text-muted-foreground">Brak danych o postępie</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Zadania oczekujące - tylko jeśli istnieją i więcej niż 10 */}
        {stats?.pending_jobs && stats.pending_jobs > 10 && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">
                    Kolejka tłumaczeń: {stats.pending_jobs} zadań
                  </span>
                </div>
                <Badge variant="secondary">{stats.pending_jobs}</Badge>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Automatyczne przetwarzanie w tle jest aktywne
              </div>
            </CardContent>
          </Card>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default TranslationStatsPanel;