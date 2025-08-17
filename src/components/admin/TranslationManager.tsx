import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Play, Settings, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAutoTranslation } from '@/hooks/useAutoTranslation';

const TranslationManager: React.FC = () => {
  const {
    stats,
    jobs,
    loading,
    setupInitialTranslations,
    processPendingTranslations,
    forceProcessAllPending,
    refreshData
  } = useAutoTranslation();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const usagePercentage = stats ? (stats.characters_used / stats.characters_limit) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Zarządzanie tłumaczeniami AI</h2>
          <p className="text-muted-foreground">
            Automatyczne tłumaczenia produktów i FAQ za pomocą DeepL API
          </p>
        </div>
        <Button
          onClick={refreshData}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Odśwież
        </Button>
      </div>

      {/* Statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Użycie miesięczne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Znaki</span>
                <span>
                  {stats ? `${stats.characters_used.toLocaleString()} / ${stats.characters_limit.toLocaleString()}` : '0 / 500,000'}
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {usagePercentage.toFixed(1)}% wykorzystania
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Wywołania API</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.api_calls || 0}</div>
            <p className="text-xs text-muted-foreground">
              W tym miesiącu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Oczekujące zadania</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{stats?.pending_jobs || 0}</div>
              {stats?.limit_reached && (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.limit_reached ? 'Limit osiągnięty' : 'Do przetworzenia'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Panel kontrolny */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Panel kontrolny</span>
          </CardTitle>
          <CardDescription>
            Zarządzanie automatycznymi tłumaczeniami
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={setupInitialTranslations}
              disabled={loading}
              variant="default"
            >
              <Play className="h-4 w-4 mr-2" />
              Uruchom pierwsze tłumaczenia
            </Button>
            
            <Button
              onClick={processPendingTranslations}
              disabled={loading || stats?.pending_jobs === 0 || stats?.limit_reached}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Przetwórz oczekujące ({stats?.pending_jobs || 0})
            </Button>

            <Button
              onClick={forceProcessAllPending}
              disabled={loading || stats?.pending_jobs === 0 || stats?.limit_reached}
              variant="destructive"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Force Processing (Wszystkie)
            </Button>
          </div>

          {stats?.limit_reached && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div className="text-sm text-red-700">
                <strong>Osiągnięto limit miesięczny.</strong> Przetwarzanie zostanie wznowione w następnym miesiącu.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historia zadań */}
      <Card>
        <CardHeader>
          <CardTitle>Ostatnie zadania tłumaczeń</CardTitle>
          <CardDescription>
            Poniżej znajdują się ostatnie 20 zadań tłumaczeń
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {jobs.slice(0, 20).map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(job.status)}
                  <div>
                    <div className="text-sm font-medium">
                      {job.content_type === 'faq' ? 'FAQ' : 'Produkt'}: {job.content_id}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {job.source_language.toUpperCase()} → {job.target_language.toUpperCase()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusVariant(job.status)}>
                    {job.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {job.characters_used || 0} zn.
                  </span>
                </div>
              </div>
            ))}

            {jobs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Brak zadań tłumaczeń
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranslationManager;