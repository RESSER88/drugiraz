import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  Globe, 
  Play, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  RefreshCw,
  Zap,
  Target
} from 'lucide-react';
import { useZCTPriorityManager } from '@/hooks/useZCTPriorityManager';

const ZCTStrategicDashboard: React.FC = () => {
  const {
    languageProgress,
    priorityStatuses,
    loading,
    startPriorityTranslation,
    refreshAllData,
    getLanguageDisplayName,
    hasActivePriority,
    getActivePriorityLanguage,
    totalProgress
  } = useZCTPriorityManager();

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressVariant = (percentage: number): "default" | "secondary" | "destructive" => {
    if (percentage >= 90) return 'default';
    if (percentage >= 50) return 'secondary';
    return 'destructive';
  };

  const activePriorityLang = getActivePriorityLanguage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">ZCT 2.0 – Pulpity Strategiczne</h2>
          <p className="text-muted-foreground">
            Kontroluj proces tłumaczeń język po języku
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={refreshAllData}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Odśwież
          </Button>
        </div>
      </div>

      {/* Global Progress Summary */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Postęp Globalny
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getProgressColor(totalProgress)}`}>
                {totalProgress}%
              </div>
              <p className="text-sm text-muted-foreground">Średni postęp</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {languageProgress.filter(l => l.completion_percentage >= 90).length}/4
              </div>
              <p className="text-sm text-muted-foreground">Języków ukończonych</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {hasActivePriority() ? '1' : '0'}
              </div>
              <p className="text-sm text-muted-foreground">Aktywny priorytet</p>
            </div>
          </div>
          
          {hasActivePriority() && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-600" />
                <span className="font-semibold text-orange-800">
                  Tryb priorytetowy aktywny dla języka: {getLanguageDisplayName(activePriorityLang!)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Language Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {languageProgress.map((lang) => {
          const priorityStatus = priorityStatuses[lang.language];
          const isPriorityActive = priorityStatus?.is_active || false;
          const isOtherPriorityActive = hasActivePriority() && activePriorityLang !== lang.language;

          return (
            <Card 
              key={lang.language} 
              className={`relative ${isPriorityActive ? 'border-orange-500 bg-orange-50' : ''}`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">
                      {lang.language.toUpperCase()}
                    </Badge>
                    <span>{getLanguageDisplayName(lang.language)}</span>
                  </div>
                  
                  {isPriorityActive && (
                    <div className="flex items-center gap-1 text-orange-600">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm font-medium">PRIORYTET</span>
                    </div>
                  )}
                  
                  {lang.completion_percentage >= 90 && !isPriorityActive && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </CardTitle>
                
                <CardDescription>
                  {isPriorityActive ? 
                    `Tłumaczenie priorytetowe w toku...` :
                    `${lang.completed} z ${lang.total_items} elementów przetłumaczonych`
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Postęp</span>
                    <span className={`text-lg font-bold ${getProgressColor(lang.completion_percentage)}`}>
                      {lang.completion_percentage}%
                    </span>
                  </div>
                  <Progress 
                    value={lang.completion_percentage} 
                    className="h-3"
                  />
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">{lang.completed}</div>
                    <div className="text-xs text-green-700">Gotowe</div>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded">
                    <div className="text-lg font-bold text-yellow-600">{lang.pending}</div>
                    <div className="text-xs text-yellow-700">Oczekuje</div>
                  </div>
                  <div className="p-2 bg-red-50 rounded">
                    <div className="text-lg font-bold text-red-600">{lang.failed}</div>
                    <div className="text-xs text-red-700">Błędy</div>
                  </div>
                </div>

                {/* Priority Status */}
                {isPriorityActive && priorityStatus && (
                  <div className="p-3 bg-orange-100 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">
                        Priorytet w toku
                      </span>
                    </div>
                    <div className="text-xs text-orange-700">
                      Przetworzone: {priorityStatus.processed_count}/{priorityStatus.total_count}
                    </div>
                    {priorityStatus.started_at && (
                      <div className="text-xs text-orange-700">
                        Rozpoczęte: {new Date(priorityStatus.started_at).toLocaleString('pl')}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-2">
                  {isPriorityActive ? (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled
                    >
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Tłumaczenie w toku...
                    </Button>
                  ) : (
                    <Button
                      onClick={() => startPriorityTranslation(lang.language)}
                      disabled={loading || isOtherPriorityActive || lang.pending === 0}
                      className="w-full"
                      variant={lang.pending > 0 ? "default" : "secondary"}
                    >
                      {lang.pending === 0 ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Wszystko przetłumaczone
                        </>
                      ) : isOtherPriorityActive ? (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          Czeka na inny priorytet
                        </>
                      ) : (
                        <>
                          <Target className="h-4 w-4 mr-2" />
                          Uruchom priorytet ({lang.pending} zadań)
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Warning for failed items */}
                {lang.failed > 0 && !isPriorityActive && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700">
                      {lang.failed} elementów wymaga uwagi
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Jak używać pulpitów strategicznych?</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 space-y-2">
          <p>• <strong>Postęp</strong>: Każda karta pokazuje dokładny postęp dla jednego języka</p>
          <p>• <strong>Priorytet</strong>: Kliknij "Uruchom priorytet" aby przetłumaczyć cały język przed innymi</p>
          <p>• <strong>Kolejkowanie</strong>: Można uruchomić tylko jeden priorytet na raz</p>
          <p>• <strong>Monitoring</strong>: Aktywny priorytet aktualizuje się automatycznie co 10 sekund</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZCTStrategicDashboard;