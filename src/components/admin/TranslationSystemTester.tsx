import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export const TranslationSystemTester: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const updateTestResult = (step: string, status: 'pending' | 'success' | 'error', message: string, details?: any) => {
    setTestResults(prev => {
      const newResults = [...prev];
      const existingIndex = newResults.findIndex(r => r.step === step);
      
      if (existingIndex >= 0) {
        newResults[existingIndex] = { step, status, message, details };
      } else {
        newResults.push({ step, status, message, details });
      }
      
      return newResults;
    });
  };

  const runComprehensiveTest = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Sprawdź strukturę bazy danych
      updateTestResult('database', 'pending', 'Sprawdzanie struktury bazy danych...');
      
      const { data: productTranslationsSchema, error: schemaError } = await supabase
        .from('product_translations')
        .select('*')
        .limit(1);

      if (schemaError) {
        updateTestResult('database', 'error', `Błąd struktury bazy: ${schemaError.message}`);
        return;
      }
      
      updateTestResult('database', 'success', 'Struktura bazy danych poprawna');

      // Test 2: Sprawdź istniejące tłumaczenia
      updateTestResult('existing_translations', 'pending', 'Sprawdzanie istniejących tłumaczeń...');
      
      const { data: existingTranslations, error: translationsError } = await supabase
        .from('product_translations')
        .select('language, field_name, count')
        .limit(10);

      if (translationsError) {
        updateTestResult('existing_translations', 'error', `Błąd pobierania tłumaczeń: ${translationsError.message}`);
      } else {
        updateTestResult('existing_translations', 'success', 
          `Znaleziono ${existingTranslations?.length || 0} istniejących tłumaczeń`, 
          existingTranslations);
      }

      // Test 3: Sprawdź połączenie z edge function
      updateTestResult('edge_function', 'pending', 'Testowanie połączenia z edge function...');
      
      try {
        const { data: statsData, error: statsError } = await supabase.functions.invoke('auto-translate', {
          body: { action: 'get_stats' }
        });

        if (statsError) {
          updateTestResult('edge_function', 'error', `Błąd edge function: ${statsError.message}`);
        } else {
          updateTestResult('edge_function', 'success', 
            'Edge function działa poprawnie', 
            statsData);
        }
      } catch (error) {
        updateTestResult('edge_function', 'error', `Błąd połączenia: ${error.message}`);
      }

      // Test 4: Sprawdź konfigurację API DeepL
      updateTestResult('deepl_config', 'pending', 'Sprawdzanie konfiguracji DeepL API...');
      
      const { data: apiKeys, error: apiKeysError } = await supabase
        .from('deepl_api_keys')
        .select('*')
        .eq('is_active', true);

      if (apiKeysError) {
        updateTestResult('deepl_config', 'error', `Błąd konfiguracji API: ${apiKeysError.message}`);
      } else if (!apiKeys || apiKeys.length === 0) {
        updateTestResult('deepl_config', 'error', 'Brak aktywnych kluczy API DeepL');
      } else {
        updateTestResult('deepl_config', 'success', 
          `Znaleziono ${apiKeys.length} aktywnych kluczy API`, 
          apiKeys.map(k => ({ masked: k.api_key_masked, status: k.status })));
      }

      // Test 5: Test tłumaczenia próbnego
      if (apiKeys && apiKeys.length > 0) {
        updateTestResult('translation_test', 'pending', 'Wykonywanie testu tłumaczenia...');
        
        try {
          const { data: translationResult, error: translationError } = await supabase.functions.invoke('auto-translate', {
            body: { 
              action: 'translate_text',
              text: 'Test tłumaczenia systemu',
              target_lang: 'en',
              source_lang: 'pl'
            }
          });

          if (translationError) {
            updateTestResult('translation_test', 'error', `Błąd tłumaczenia: ${translationError.message}`);
          } else {
            updateTestResult('translation_test', 'success', 
              `Tłumaczenie udane: "${translationResult.translated_text}"`, 
              translationResult);
          }
        } catch (error) {
          updateTestResult('translation_test', 'error', `Błąd testu tłumaczenia: ${error.message}`);
        }
      }

      // Test 6: Sprawdź real-time integration
      updateTestResult('realtime_integration', 'pending', 'Sprawdzanie integracji real-time...');
      
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(1);

      if (productsError) {
        updateTestResult('realtime_integration', 'error', `Błąd dostępu do produktów: ${productsError.message}`);
      } else if (!products || products.length === 0) {
        updateTestResult('realtime_integration', 'error', 'Brak produktów do testowania');
      } else {
        updateTestResult('realtime_integration', 'success', 'Integracja real-time skonfigurowana');
      }

      toast({
        title: 'Test zakończony',
        description: 'Sprawdź wyniki poniżej',
        variant: 'default'
      });

    } catch (error) {
      updateTestResult('general', 'error', `Błąd ogólny: ${error.message}`);
      
      toast({
        title: 'Błąd testu',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default: return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'success': return 'success' as const;
      case 'error': return 'destructive' as const;
      case 'pending': return 'warning' as const;
      default: return 'default' as const;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5" />
          System Tester Tłumaczeń AI
        </CardTitle>
        <CardDescription>
          Kompleksowy test wszystkich komponentów systemu tłumaczeń AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          onClick={runComprehensiveTest} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Testowanie...' : 'Uruchom Pełny Test Systemu'}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <h3 className="text-lg font-semibold">Wyniki Testów</h3>
            
            {testResults.map((result, index) => (
              <Alert key={index} variant={getStatusVariant(result.status)}>
                <div className="flex items-start gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">
                        {result.step.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <AlertDescription>
                      {result.message}
                      {result.details && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm font-medium">
                            Szczegóły
                          </summary>
                          <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {testResults.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h4 className="font-medium mb-2">Podsumowanie</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-green-600">
                  {testResults.filter(r => r.status === 'success').length}
                </div>
                <div>Udane</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-red-600">
                  {testResults.filter(r => r.status === 'error').length}
                </div>
                <div>Błędy</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-600">
                  {testResults.filter(r => r.status === 'pending').length}
                </div>
                <div>W toku</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};