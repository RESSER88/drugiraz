import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Globe, 
  Database, 
  Activity, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  XCircle,
  Search,
  ExternalLink
} from 'lucide-react';
import { useZCTDiagnostics } from '@/hooks/useZCTDiagnostics';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const ZCTDashboard: React.FC = () => {
  const {
    stats,
    translations,
    recentActivity,
    loading,
    checkTranslationStatus,
    refreshAllData,
    isApiOnline,
    hasTranslations,
    completionRate
  } = useZCTDiagnostics();

  const [searchTerm, setSearchTerm] = useState('');
  const [checkingStatus, setCheckingStatus] = useState<string | null>(null);

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
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
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
        return 'outline';
    }
  };

  const handleStatusCheck = async (contentType: string, contentId: string, targetLanguage: string) => {
    const key = `${contentType}_${contentId}_${targetLanguage}`;
    setCheckingStatus(key);
    
    try {
      const result = await checkTranslationStatus(contentType, contentId, targetLanguage);
      console.log('🔍 Status check result:', result);
      
      // Refresh data to show updated status
      await refreshAllData();
    } catch (error) {
      console.error('❌ Status check failed:', error);
    } finally {
      setCheckingStatus(null);
    }
  };

  const filteredTranslations = translations.filter(t => 
    searchTerm === '' || 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.content_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.content_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Zintegrowane Centrum Tłumaczeń (ZCT)</h2>
          <p className="text-muted-foreground">
            Kompleksowe zarządzanie i diagnostyka systemu tłumaczeń
          </p>
        </div>
        <Button
          onClick={refreshAllData}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Odśwież dane
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Pulpit
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Szczegóły
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Dziennik
          </TabsTrigger>
        </TabsList>

        {/* SEKCJA 1: PULPIT (Dashboard) */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Widget stanu API */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Stan połączenia z API
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isApiOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-semibold">
                  {isApiOnline ? 'ONLINE' : 'BŁĄD'}
                </span>
                <Badge variant={isApiOnline ? 'default' : 'destructive'}>
                  DeepL API
                </Badge>
              </div>
              {!isApiOnline && (
                <p className="text-sm text-red-600 mt-2">
                  Sprawdź klucz API lub połączenie internetowe
                </p>
              )}
            </CardContent>
          </Card>

          {/* Główne statystyki */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Wszystkie elementy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_items || 0}</div>
                <p className="text-xs text-muted-foreground">W systemie</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Ukończone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.completed_translations || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {completionRate.toFixed(1)}% ukończenia
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Oczekujące</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats?.pending_translations || 0}</div>
                <p className="text-xs text-muted-foreground">Do tłumaczenia</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Błędy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats?.failed_translations || 0}</div>
                <p className="text-xs text-muted-foreground">Wymagają uwagi</p>
              </CardContent>
            </Card>
          </div>

          {/* Postęp dla języków */}
          <Card>
            <CardHeader>
              <CardTitle>Postęp tłumaczeń według języków</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats?.language_breakdown && Object.entries(stats.language_breakdown).map(([lang, data]) => {
                const total = data.completed + data.pending + data.failed;
                const progress = total > 0 ? (data.completed / total) * 100 : 0;
                
                return (
                  <div key={lang} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{lang.toUpperCase()}</span>
                      <div className="flex gap-2 text-sm">
                        <Badge variant="default">{data.completed}</Badge>
                        <Badge variant="secondary">{data.pending}</Badge>
                        <Badge variant="destructive">{data.failed}</Badge>
                      </div>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {progress.toFixed(1)}% ukończone ({data.completed}/{total})
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Ostatnie aktywności */}
          <Card>
            <CardHeader>
              <CardTitle>Ostatnie aktywności</CardTitle>
              <CardDescription>5 ostatnich operacji w systemie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(activity.status)}
                      <span className="text-sm">
                        {activity.content_type}: {activity.content_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(activity.status)}>
                        {activity.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.updated_at).toLocaleString('pl')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEKCJA 2: TABELA SZCZEGÓŁOWA */}
        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Szczegółowe zarządzanie treścią</CardTitle>
              <CardDescription>
                Tabela z ID bazy danych i możliwością sprawdzenia statusu w czasie rzeczywistym
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <Input
                    placeholder="Szukaj po nazwie, ID lub typie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>

                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">ID Bazy Danych</th>
                        <th className="text-left p-3">Nazwa Elementu</th>
                        <th className="text-left p-3">Typ</th>
                        <th className="text-left p-3">Język</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Znaki</th>
                        <th className="text-left p-3">Akcje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTranslations.map((translation) => {
                        const isChecking = checkingStatus === `${translation.content_type}_${translation.content_id}_${translation.target_language}`;
                        
                        return (
                          <tr key={translation.id} className="border-b hover:bg-muted/50">
                            <td className="p-3 font-mono text-xs">
                              {translation.content_type}_{translation.content_id}
                            </td>
                            <td className="p-3">
                              <div className="font-medium">{translation.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {translation.source_language.toUpperCase()} → {translation.target_language.toUpperCase()}
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline">{translation.content_type}</Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant="secondary">{translation.target_language.toUpperCase()}</Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(translation.status)}
                                <Badge variant={getStatusVariant(translation.status)}>
                                  {translation.status}
                                </Badge>
                              </div>
                            </td>
                            <td className="p-3 text-sm">
                              {translation.characters_used || 0}
                            </td>
                            <td className="p-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusCheck(
                                  translation.content_type, 
                                  translation.content_id, 
                                  translation.target_language
                                )}
                                disabled={isChecking}
                              >
                                {isChecking ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  'Sprawdź'
                                )}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {filteredTranslations.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'Brak wyników wyszukiwania' : 'Brak danych tłumaczeń'}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEKCJA 3: DZIENNIK ZDARZEŃ */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dziennik zdarzeń systemu tłumaczeń</CardTitle>
              <CardDescription>
                Historia wszystkich operacji z możliwością filtrowania
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Data i Godzina</th>
                        <th className="text-left p-3">ID Elementu</th>
                        <th className="text-left p-3">Język</th>
                        <th className="text-left p-3">Akcja</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Błąd</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivity.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-muted/50">
                          <td className="p-3 text-sm">
                            {new Date(log.updated_at).toLocaleString('pl')}
                          </td>
                          <td className="p-3 font-mono text-xs">
                            {log.content_type}_{log.content_id}
                          </td>
                          <td className="p-3">
                            <Badge variant="secondary">
                              {log.source_language.toUpperCase()} → {log.target_language.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-3">Tłumaczenie</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(log.status)}
                              <Badge variant={getStatusVariant(log.status)}>
                                {log.status}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-3 text-xs text-red-600">
                            {log.error_message ? log.error_message.substring(0, 50) + '...' : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ZCTDashboard;