import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  PlayCircle, 
  PauseCircle, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Activity,
  Zap,
  Timer
} from 'lucide-react';

interface SystemStats {
  pending_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  characters_used: number;
  characters_limit: number;
  api_calls: number;
  cron_active: boolean;
}

interface TranslationProgress {
  content_type: string;
  target_language: string;
  pending_count: number;
  completed_count: number;
  progress_percent: number;
}

export const TranslationAutomation: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [progress, setProgress] = useState<TranslationProgress[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  };

  const loadSystemStats = async () => {
    try {
      // Get translation jobs stats
      const { data: jobStats } = await supabase
        .from('translation_jobs')
        .select('status, characters_used')
        .limit(5000);

      // Get current month stats
      const { data: monthStats } = await supabase
        .from('translation_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (jobStats && monthStats) {
        const pending = jobStats.filter(j => j.status === 'pending').length;
        const completed = jobStats.filter(j => j.status === 'completed').length;
        const failed = jobStats.filter(j => j.status === 'failed').length;
        
        setStats({
          pending_jobs: pending,
          completed_jobs: completed,
          failed_jobs: failed,
          characters_used: monthStats[0]?.characters_used || 0,
          characters_limit: monthStats[0]?.characters_limit || 500000,
          api_calls: monthStats[0]?.api_calls || 0,
          cron_active: true // We'll detect this from actual runs
        });
      }
    } catch (error) {
      console.error('Error loading system stats:', error);
      addLog(`ERROR: Failed to load system stats - ${error.message}`);
    }
  };

  const loadProgress = async () => {
    try {
      const { data: progressData } = await supabase
        .from('translation_jobs')
        .select('content_type, target_language, status')
        .limit(5000);

      if (progressData) {
        const progressMap = new Map<string, any>();
        
        progressData.forEach(job => {
          const key = `${job.content_type}-${job.target_language}`;
          if (!progressMap.has(key)) {
            progressMap.set(key, {
              content_type: job.content_type,
              target_language: job.target_language,
              pending_count: 0,
              completed_count: 0
            });
          }
          
          const item = progressMap.get(key);
          if (job.status === 'pending') item.pending_count++;
          if (job.status === 'completed') item.completed_count++;
        });

        const progressArray = Array.from(progressMap.values()).map(item => ({
          ...item,
          progress_percent: Math.round(
            (item.completed_count / (item.completed_count + item.pending_count)) * 100
          )
        }));

        setProgress(progressArray);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      addLog(`ERROR: Failed to load progress - ${error.message}`);
    }
  };

  const runAnalysis = async () => {
    addLog('🔍 ANALIZA: Sprawdzanie mechanizmu tłumaczeń...');
    await loadSystemStats();
    await loadProgress();
    
    if (stats && stats.pending_jobs > 0) {
      addLog(`⚠️ WYKRYTO: ${stats.pending_jobs} oczekujących tłumaczeń`);
      return true;
    }
    
    addLog('✅ ANALIZA: System w porządku');
    return false;
  };

  const runRepair = async () => {
    addLog('🔧 NAPRAWA: Uruchamianie catch-up tłumaczeń...');
    setIsRunning(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('auto-translate', {
        body: { action: 'process_pending_translations' }
      });

      if (error) throw error;

      if (data.success) {
        addLog(`✅ NAPRAWA: Przetłumaczono ${data.processed_count} elementów (${data.characters_used} znaków)`);
        toast({
          title: 'Catch-up zakończony',
          description: `Przetłumaczono ${data.processed_count} elementów`,
          variant: 'default'
        });
      } else {
        addLog(`ℹ️ NAPRAWA: ${data.message}`);
      }
    } catch (error) {
      addLog(`❌ NAPRAWA: Błąd - ${error.message}`);
      toast({
        title: 'Błąd naprawy',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runRegressionTest = async () => {
    addLog('🧪 TEST: Sprawdzanie poprawności tłumaczeń...');
    await loadSystemStats();
    await loadProgress();
    
    const issues: string[] = [];
    
    if (stats && stats.failed_jobs > 0) {
      issues.push(`${stats.failed_jobs} nieudanych tłumaczeń`);
    }
    
    if (issues.length > 0) {
      addLog(`⚠️ TEST: Wykryto problemy - ${issues.join(', ')}`);
      return false;
    }
    
    addLog('✅ TEST: Wszystkie testy przeszły');
    return true;
  };

  const runFullCycle = async () => {
    addLog('🚀 ROZPOCZĘCIE PEŁNEGO CYKLU NAPRAWY');
    
    const needsRepair = await runAnalysis();
    
    if (needsRepair) {
      await runRepair();
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
      await runRegressionTest();
    }
    
    addLog('🏁 CYKL ZAKOŃCZONY');
    
    if (autoMode) {
      setTimeout(runFullCycle, 30000); // Run again in 30 seconds
    }
  };

  const toggleAutoMode = () => {
    setAutoMode(!autoMode);
    if (!autoMode) {
      addLog('🤖 TRYB AUTOMATYCZNY: Włączony');
      runFullCycle();
    } else {
      addLog('⏸️ TRYB AUTOMATYCZNY: Wyłączony');
    }
  };

  const forceProcessAll = async () => {
    addLog('⚡ FORCE: Przetwarzanie wszystkich pending translations...');
    setIsRunning(true);
    
    try {
      // First setup initial translations if needed
      const { data: setupData, error: setupError } = await supabase.functions.invoke('schedule-translations', {
        body: { action: 'initial_setup' }
      });

      if (setupError) throw setupError;
      
      addLog(`✅ SETUP: Zaplanowano ${setupData.faq_result?.scheduled_faq_items || 0} FAQ, ${setupData.products_result?.scheduled_products || 0} produktów`);

      // Then process all pending
      let totalProcessed = 0;
      let continueProcessing = true;
      
      while (continueProcessing && totalProcessed < 500) { // Safety limit
        const { data, error } = await supabase.functions.invoke('auto-translate', {
          body: { action: 'process_pending_translations' }
        });

        if (error) throw error;

        if (data.success && data.processed_count > 0) {
          totalProcessed += data.processed_count;
          addLog(`📈 PROGRESS: +${data.processed_count} tłumaczeń (łącznie: ${totalProcessed})`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between batches
        } else {
          continueProcessing = false;
          addLog('🏁 FORCE: Wszystkie tłumaczenia zakończone');
        }
      }

      toast({
        title: 'Force processing zakończony',
        description: `Przetłumaczono łącznie ${totalProcessed} elementów`,
        variant: 'default'
      });

    } catch (error) {
      addLog(`❌ FORCE: Błąd - ${error.message}`);
      toast({
        title: 'Błąd force processing',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
      await loadSystemStats();
      await loadProgress();
    }
  };

  useEffect(() => {
    loadSystemStats();
    loadProgress();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (!isRunning) {
        loadSystemStats();
        loadProgress();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const charactersProgress = stats ? (stats.characters_used / stats.characters_limit) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oczekujące</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.pending_jobs || 0}
            </div>
            <p className="text-xs text-muted-foreground">zadań do tłumaczenia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zakończone</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.completed_jobs || 0}
            </div>
            <p className="text-xs text-muted-foreground">ukończonych tłumaczeń</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Błędne</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.failed_jobs || 0}
            </div>
            <p className="text-xs text-muted-foreground">nieudanych prób</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.api_calls || 0}
            </div>
            <p className="text-xs text-muted-foreground">wywołań API</p>
          </CardContent>
        </Card>
      </div>

      {/* Characters Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Wykorzystanie znaków DeepL</CardTitle>
          <CardDescription>
            {stats?.characters_used || 0} / {stats?.characters_limit || 500000} znaków w tym miesiącu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={charactersProgress} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2">
            Pozostało: {stats ? stats.characters_limit - stats.characters_used : 0} znaków
          </p>
        </CardContent>
      </Card>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Panel Sterowania Automatem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={runFullCycle}
              disabled={isRunning}
              variant="default"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <PlayCircle className="h-4 w-4 mr-2" />
              )}
              Uruchom Cykl Naprawy
            </Button>

            <Button
              onClick={toggleAutoMode}
              variant={autoMode ? "destructive" : "secondary"}
            >
              {autoMode ? (
                <PauseCircle className="h-4 w-4 mr-2" />
              ) : (
                <PlayCircle className="h-4 w-4 mr-2" />
              )}
              {autoMode ? 'Zatrzymaj Auto' : 'Tryb Automatyczny'}
            </Button>

            <Button
              onClick={forceProcessAll}
              disabled={isRunning}
              variant="outline"
            >
              <Zap className="h-4 w-4 mr-2" />
              Force All Translations
            </Button>

            <Button
              onClick={() => {
                loadSystemStats();
                loadProgress();
                addLog('🔄 REFRESH: Odświeżono dane systemu');
              }}
              variant="ghost"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Odśwież
            </Button>
          </div>

          {autoMode && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
              <span className="text-sm font-medium text-blue-800">
                Tryb automatyczny aktywny - system działa w pętli co 30 sekund
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress by Content Type */}
      {progress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Postęp Tłumaczeń</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progress.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.content_type}</Badge>
                      <Badge variant="secondary">{item.target_language}</Badge>
                    </div>
                    <span className="text-sm font-medium">{item.progress_percent}%</span>
                  </div>
                  <Progress value={item.progress_percent} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    Ukończone: {item.completed_count}, Oczekujące: {item.pending_count}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logi Systemu (Live)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">Brak logów systemu...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};