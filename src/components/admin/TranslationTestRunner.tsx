import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Play } from 'lucide-react';
import { testTranslationSystem } from '@/utils/translationTestRunner';

export const TranslationTestRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const runTest = async () => {
    setIsRunning(true);
    setTestResult(null);
    
    try {
      const result = await testTranslationSystem();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusBadge = (percent: number) => {
    if (percent >= 100) return <Badge className="bg-green-500">100% Kompletne</Badge>;
    if (percent >= 75) return <Badge className="bg-yellow-500">75%+ Częściowe</Badge>;
    if (percent > 0) return <Badge className="bg-orange-500">{percent}% Rozpoczęte</Badge>;
    return <Badge variant="destructive">0% Brak</Badge>;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Test Systemu Tłumaczeń AI
        </CardTitle>
        <CardDescription>
          Wykonaj pełny test end-to-end systemu tłumaczeń
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTest} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Wykonywanie testu...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Uruchom Test Kompletny
            </>
          )}
        </Button>

        {testResult && (
          <div className="space-y-4">
            <Alert className={testResult.success ? "border-green-500" : "border-red-500"}>
              <div className="flex items-center gap-2">
                {getStatusIcon(testResult.success)}
                <AlertDescription className="font-medium">
                  Test {testResult.success ? 'ZAKOŃCZONY SUKCESEM' : 'NIEUDANY'}
                  {testResult.processingTime && ` (${testResult.processingTime}ms)`}
                </AlertDescription>
              </div>
            </Alert>

            {testResult.success && (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Produkt Testowy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">{testResult.productName}</p>
                    <p className="text-xs text-muted-foreground">{testResult.productId}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Pokrycie Tłumaczeń</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getStatusBadge(testResult.coveragePercent)}
                    <p className="text-xs text-muted-foreground mt-1">
                      {testResult.translationsCreated}/{testResult.expectedTranslations} pól
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {testResult.languageCoverage && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Pokrycie według Języków</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(testResult.languageCoverage).map(([lang, count]) => (
                      <div key={lang} className="text-center">
                        <div className="text-lg font-bold">{count as number}</div>
                        <div className="text-xs text-muted-foreground uppercase">{lang}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {testResult.error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Błąd:</strong> {testResult.error}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-xs text-muted-foreground">
              Test wykonany: {new Date(testResult.timestamp).toLocaleString('pl-PL')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TranslationTestRunner;