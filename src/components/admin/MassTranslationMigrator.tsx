import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Zap, AlertTriangle } from 'lucide-react';
import { executeMassTranslationMigration } from '@/utils/massTranslationMigration';

export const MassTranslationMigrator: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  const runMigration = async () => {
    setIsRunning(true);
    setMigrationResult(null);
    setProgress(0);
    
    try {
      const result = await executeMassTranslationMigration();
      setMigrationResult(result);
      setProgress(100);
    } catch (error) {
      setMigrationResult({
        totalProducts: 0,
        processedProducts: 0,
        successfulProducts: 0,
        failedProducts: 0,
        totalTranslations: 0,
        errors: [error.message],
        processingTime: 0
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getProgressPercent = () => {
    if (!migrationResult || migrationResult.totalProducts === 0) return 0;
    return Math.round((migrationResult.processedProducts / migrationResult.totalProducts) * 100);
  };

  const getStatusBadge = () => {
    if (!migrationResult) return null;
    
    const successRate = migrationResult.totalProducts > 0 
      ? Math.round((migrationResult.successfulProducts / migrationResult.totalProducts) * 100)
      : 0;
      
    if (successRate >= 95) return <Badge className="bg-green-500">Sukces 100%</Badge>;
    if (successRate >= 80) return <Badge className="bg-yellow-500">Częściowy Sukces</Badge>;
    if (successRate > 0) return <Badge className="bg-orange-500">Problemy</Badge>;
    return <Badge variant="destructive">Błąd</Badge>;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Masowa Migracja Tłumaczeń
        </CardTitle>
        <CardDescription>
          Uruchom pełną migrację tłumaczeń dla wszystkich produktów w bazie danych
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!migrationResult && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Uwaga:</strong> Ten proces przetłumaczy wszystkie produkty na 4 języki (EN, DE, SK, CS). 
              Może to zająć kilka minut i wykorzystać quota API DeepL.
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={runMigration} 
          disabled={isRunning}
          className="w-full"
          size="lg"
        >
          {isRunning ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Migracja w toku...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Uruchom Masową Migrację
            </>
          )}
        </Button>

        {isRunning && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Przetwarzanie produktów... {progress}%
            </p>
          </div>
        )}

        {migrationResult && (
          <div className="space-y-4">
            <Alert className={migrationResult.errors.length === 0 ? "border-green-500" : "border-orange-500"}>
              <div className="flex items-center gap-2">
                {migrationResult.errors.length === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                )}
                <AlertDescription className="font-medium">
                  Migracja zakończona w {Math.round(migrationResult.processingTime / 1000)}s
                </AlertDescription>
                {getStatusBadge()}
              </div>
            </Alert>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Produkty</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{migrationResult.processedProducts}</div>
                  <p className="text-xs text-muted-foreground">z {migrationResult.totalProducts}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Sukces</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{migrationResult.successfulProducts}</div>
                  <p className="text-xs text-muted-foreground">produktów</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Błędy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{migrationResult.failedProducts}</div>
                  <p className="text-xs text-muted-foreground">produktów</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Tłumaczenia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{migrationResult.totalTranslations}</div>
                  <p className="text-xs text-muted-foreground">utworzonych</p>
                </CardContent>
              </Card>
            </div>

            {migrationResult.errors.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-red-600">Błędy ({migrationResult.errors.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {migrationResult.errors.map((error: string, index: number) => (
                      <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-xs text-muted-foreground">
              Migracja wykonana: {new Date().toLocaleString('pl-PL')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MassTranslationMigrator;