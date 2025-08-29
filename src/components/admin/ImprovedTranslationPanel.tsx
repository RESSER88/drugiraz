import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  Play, 
  Settings, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  TestTube,
  Database,
  Activity,
  Loader2,
  Zap,
  Search,
  Languages,
  FileText,
  BarChart,
  CheckCircle2,
  CircleX,
  PlayCircle,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Target languages - SK instead of FR
const TARGET_LANGUAGES = ['en', 'de', 'sk', 'cs'];

interface ApiKey {
  id: string;
  name: string;
  api_key_masked: string;
  is_primary: boolean;
  is_active: boolean;
  status: string;
  quota_used: number;
  quota_remaining: number;
  quota_limit: number;
  last_test_at: string;
  last_sync_at: string;
  quota_reset_date?: string;
}

interface TranslationLog {
  id: string;
  product_id: string;
  api_key_used: string;
  translation_mode: string;
  field_name: string;
  source_language: string;
  target_language: string;
  status: string;
  characters_used: number;
  error_details?: string;
  processing_time_ms: number;
  created_at: string;
  request_payload?: any;
  response_payload?: any;
}

interface Product {
  id: string;
  name: string;
  serial_number: string;
  short_description?: string;
  detailed_description?: string;
}

interface UntranslatedProduct extends Product {
  missingLanguages: string[];
  translationProgress: number;
  status: 'complete' | 'partial' | 'none';
}

interface AutoTranslationProgress {
  isRunning: boolean;
  currentProduct: string;
  processedCount: number;
  totalCount: number;
  successCount: number;
  errorCount: number;
  estimatedTimeRemaining: number;
  startTime: Date;
}

const ImprovedTranslationPanel: React.FC = () => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [translationLogs, setTranslationLogs] = useState<TranslationLog[]>([]);
  const [untranslatedProducts, setUntranslatedProducts] = useState<UntranslatedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [translationMode, setTranslationMode] = useState('fallback');
  const [showLogDetails, setShowLogDetails] = useState<TranslationLog | null>(null);
  const [newApiKey, setNewApiKey] = useState({ name: '', key: '', isPrimary: false });
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  
  // Auto translation state
  const [autoProgress, setAutoProgress] = useState<AutoTranslationProgress>({
    isRunning: false,
    currentProduct: '',
    processedCount: 0,
    totalCount: 0,
    successCount: 0,
    errorCount: 0,
    estimatedTimeRemaining: 0,
    startTime: new Date()
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadApiKeys(),
        loadTranslationLogs(),
        loadUntranslatedProducts()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const loadApiKeys = async () => {
    try {
      const response = await supabase.functions.invoke('auto-translate', {
        body: { action: 'get_translation_stats' }
      });

      if (response.data?.success) {
        setApiKeys(response.data.apiKeys || []);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  };

  const loadTranslationLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('translation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTranslationLogs(data || []);
    } catch (error) {
      console.error('Error loading translation logs:', error);
    }
  };

  const loadUntranslatedProducts = async () => {
    try {
      // Get all products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, serial_number, short_description, detailed_description')
        .order('name');

      if (productsError) throw productsError;

      // Get all existing translations
      const { data: translations, error: translationsError } = await supabase
        .from('product_translations')
        .select('product_id, language, field_name');

      if (translationsError) throw translationsError;

      // Calculate translation status for each product
      const untranslatedProducts: UntranslatedProduct[] = [];

      for (const product of products || []) {
        const productTranslations = translations?.filter(t => t.product_id === product.id) || [];
        
        const languageTranslations = TARGET_LANGUAGES.map(lang => {
          const langTranslations = productTranslations.filter(t => t.language === lang);
          const hasShortDesc = langTranslations.some(t => t.field_name === 'shortDescription');
          const hasDetailedDesc = langTranslations.some(t => t.field_name === 'additionalDescription');
          
          return {
            language: lang,
            hasShortDesc,
            hasDetailedDesc,
            isComplete: hasShortDesc && hasDetailedDesc
          };
        });

        const missingLanguages = languageTranslations
          .filter(lt => !lt.isComplete)
          .map(lt => lt.language);

        const completedLanguages = languageTranslations.filter(lt => lt.isComplete).length;
        const translationProgress = (completedLanguages / TARGET_LANGUAGES.length) * 100;

        let status: 'complete' | 'partial' | 'none' = 'none';
        if (translationProgress === 100) status = 'complete';
        else if (translationProgress > 0) status = 'partial';

        // Only include products that need translation (not 100% complete)
        if (status !== 'complete') {
          untranslatedProducts.push({
            ...product,
            missingLanguages,
            translationProgress,
            status
          });
        }
      }

      setUntranslatedProducts(untranslatedProducts);
    } catch (error) {
      console.error('Error loading untranslated products:', error);
    }
  };

  const testApiConnection = async (keyId: string) => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('auto-translate', {
        body: { action: 'test_connection', keyId }
      });

      if (response.data?.success) {
        toast({
          title: "Test połączenia",
          description: "Połączenie z API działa poprawnie",
        });
        await loadApiKeys();
      } else {
        toast({
          title: "Błąd połączenia",
          description: response.data?.error || "Test nieudany",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie można przetestować połączenia",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const refreshQuota = async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('auto-translate', {
        body: { action: 'refresh_usage' }
      });

      if (response.data?.results) {
        toast({
          title: "Sukces",
          description: "Quota API została odświeżona"
        });
        await loadApiKeys();
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie można odświeżyć quota",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const addApiKey = async () => {
    if (!newApiKey.name || !newApiKey.key) {
      toast({
        title: "Błąd",
        description: "Podaj nazwę i klucz API",
        variant: "destructive"
      });
      return;
    }

    try {
      const encryptedKey = btoa(newApiKey.key);
      const maskedKey = `***${newApiKey.key.slice(-4)}`;

      const { error } = await supabase
        .from('deepl_api_keys')
        .insert({
          name: newApiKey.name,
          api_key_encrypted: encryptedKey,
          api_key_masked: maskedKey,
          is_primary: newApiKey.isPrimary,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Sukces",
        description: "Klucz API został dodany"
      });

      setNewApiKey({ name: '', key: '', isPrimary: false });
      setShowNewKeyForm(false);
      await loadApiKeys();
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie można dodać klucza API",
        variant: "destructive"
      });
    }
  };

  const translateSingleProduct = async (product: UntranslatedProduct) => {
    try {
      const productContent = {
        shortDescription: product.short_description,
        specs: {
          additionalDescription: product.detailed_description
        }
      };

      const response = await supabase.functions.invoke('auto-translate', {
        body: {
          action: 'translate_product_specifications',
          productId: product.id,
          productContent,
          translationMode
        }
      });

      if (response.data?.success) {
        const successCount = response.data.results?.filter(r => r.success).length || 0;
        const totalCount = response.data.results?.length || 0;
        
        toast({
          title: `Produkt ${product.name}`,
          description: `Przetłumaczono ${successCount}/${totalCount} pól`,
          variant: successCount === totalCount ? "default" : "destructive"
        });

        return { success: true, successCount, totalCount };
      } else {
        throw new Error(response.data?.error || 'Translation failed');
      }
    } catch (error) {
      toast({
        title: `Błąd - ${product.name}`,
        description: error.message,
        variant: "destructive"
      });
      return { success: false, successCount: 0, totalCount: 0 };
    }
  };

  const runAutomaticTranslationAnalysis = async () => {
    if (untranslatedProducts.length === 0) {
      toast({
        title: "Wszystko przetłumaczone",
        description: "Wszystkie produkty mają kompletne tłumaczenia",
      });
      return;
    }

    const progress: AutoTranslationProgress = {
      isRunning: true,
      currentProduct: '',
      processedCount: 0,
      totalCount: untranslatedProducts.length,
      successCount: 0,
      errorCount: 0,
      estimatedTimeRemaining: 0,
      startTime: new Date()
    };

    setAutoProgress(progress);

    const avgProcessingTime = 5000; // 5 seconds per product estimate

    for (let i = 0; i < untranslatedProducts.length; i++) {
      const product = untranslatedProducts[i];
      
      // Update progress
      const updatedProgress = {
        ...progress,
        currentProduct: product.name,
        processedCount: i,
        estimatedTimeRemaining: (untranslatedProducts.length - i) * avgProcessingTime
      };
      setAutoProgress(updatedProgress);

      const result = await translateSingleProduct(product);
      
      if (result.success) {
        progress.successCount++;
      } else {
        progress.errorCount++;
      }

      // Small delay between products
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Final update
    setAutoProgress({
      ...progress,
      isRunning: false,
      processedCount: untranslatedProducts.length,
      currentProduct: '',
      estimatedTimeRemaining: 0
    });

    toast({
      title: "Automatyczne tłumaczenie zakończone",
      description: `Przetłumaczono ${progress.successCount}/${untranslatedProducts.length} produktów`,
      variant: progress.errorCount === 0 ? "default" : "destructive"
    });

    // Reload data to see updated translations
    await loadUntranslatedProducts();
    await loadTranslationLogs();
  };

  const runTranslationVerificationTest = async () => {
    if (untranslatedProducts.length === 0) {
      toast({
        title: "Brak produktów do testowania",
        description: "Wszystkie produkty są już przetłumaczone",
      });
      return;
    }

    setLoading(true);
    const testProduct = untranslatedProducts[0];

    try {
      toast({
        title: "Test weryfikacyjny rozpoczęty",
        description: `Testowanie tłumaczenia produktu: ${testProduct.name}`,
      });

      // Translate the product
      await translateSingleProduct(testProduct);

      // Verify saved translations
      const { data: translations } = await supabase
        .from('product_translations')
        .select('*')
        .eq('product_id', testProduct.id);

      const expectedTranslations = TARGET_LANGUAGES.length * 2; // 2 fields per language
      const actualTranslations = translations?.length || 0;

      if (actualTranslations >= expectedTranslations * 0.8) {
        toast({
          title: "Test weryfikacyjny ✅",
          description: `Zapisano ${actualTranslations}/${expectedTranslations} tłumaczeń. System działa poprawnie!`,
        });
        
        // Test translation retrieval for frontend
        await testTranslationRetrieval(testProduct.id);
      } else {
        toast({
          title: "Test częściowo nieudany ⚠️",
          description: `Zapisano tylko ${actualTranslations}/${expectedTranslations} tłumaczeń. Sprawdź logi błędów.`,
          variant: "destructive"
        });
      }

      await loadUntranslatedProducts();
    } catch (error) {
      toast({
        title: "Test nieudany ❌",
        description: error.message || "Test się nie powiódł",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  const testTranslationRetrieval = async (productId: string) => {
    try {
      // Test if translations can be retrieved for frontend display
      const { data: translations, error } = await supabase
        .from('product_translations')
        .select('language, field_name, translated_value')
        .eq('product_id', productId);

      if (error) throw error;

      if (translations && translations.length > 0) {
        const translationsByLang = translations.reduce((acc, t) => {
          if (!acc[t.language]) acc[t.language] = {};
          acc[t.language][t.field_name] = t.translated_value;
          return acc;
        }, {} as Record<string, Record<string, string>>);

        console.log('Translation retrieval test successful:', translationsByLang);
        
        toast({
          title: "Test odczytu tłumaczeń ✅",
          description: `Poprawnie odczytano tłumaczenia dla ${Object.keys(translationsByLang).length} języków`,
        });
      } else {
        toast({
          title: "Ostrzeżenie odczytu",
          description: "Nie znaleziono tłumaczeń do odczytu",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Translation retrieval test failed:', error);
      toast({
        title: "Błąd odczytu tłumaczeń",
        description: "Nie można odczytać zapisanych tłumaczeń",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'quota_exceeded':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'default';
      case 'error':
      case 'failed':
        return 'destructive';
      case 'quota_exceeded':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatQuotaReset = (date: string) => {
    if (!date) return 'Nieznana';
    return new Date(date).toLocaleDateString('pl-PL');
  };

  const getProductStatusIcon = (status: 'complete' | 'partial' | 'none') => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'none':
        return <CircleX className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Panel Tłumaczeń AI</h3>
          <p className="text-sm text-muted-foreground">
            Zarządzanie dual-API DeepL (EN, DE, SK, CS) z automatyczną analizą błędów
          </p>
        </div>
        <Button
          onClick={loadData}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Odśwież
        </Button>
      </div>

      {/* Dual API Status Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apiKeys.map((key) => (
          <Card key={key.id} className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    key.status === 'active' ? 'bg-green-500' :
                    key.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                  }`} />
                  <span className="font-semibold">{key.name}</span>
                  {key.is_primary && (
                    <Badge variant="default" className="text-xs">PRIMARY</Badge>
                  )}
                </div>
                <Badge variant={getStatusVariant(key.status)} className="text-xs">
                  {key.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-mono">{key.api_key_masked}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quota Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pozostałe znaki:</span>
                  <span className="font-medium">
                    {(key.quota_remaining || 0).toLocaleString()} / {(key.quota_limit || 0).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      (key.quota_used / key.quota_limit) > 0.9 ? 'bg-red-500' :
                      (key.quota_used / key.quota_limit) > 0.7 ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((key.quota_used / key.quota_limit) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Reset quota: {formatQuotaReset(key.quota_reset_date)}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => testApiConnection(key.id)}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                >
                  <TestTube className="h-3 w-3 mr-1" />
                  Test
                </Button>
                <Button
                  onClick={refreshQuota}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Quota
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New API Key */}
      {!showNewKeyForm ? (
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={() => setShowNewKeyForm(true)}
              variant="outline"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Dodaj nowy klucz API
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dodaj nowy klucz DeepL API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Nazwa klucza</Label>
                <Input
                  id="keyName"
                  value={newApiKey.name}
                  onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="np. DeepL Primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">Klucz API</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={newApiKey.key}
                  onChange={(e) => setNewApiKey(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="Wklej klucz DeepL"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPrimary"
                checked={newApiKey.isPrimary}
                onChange={(e) => setNewApiKey(prev => ({ ...prev, isPrimary: e.target.checked }))}
              />
              <Label htmlFor="isPrimary">Ustaw jako klucz główny</Label>
            </div>
            <div className="flex space-x-2">
              <Button onClick={addApiKey} disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                Dodaj klucz
              </Button>
              <Button
                onClick={() => setShowNewKeyForm(false)}
                variant="outline"
              >
                Anuluj
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Translation Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Zarządzanie Tłumaczeniami
          </CardTitle>
          <CardDescription>
            Automatyczna analiza i tłumaczenie produktów nieprzetłumaczonych na języki: EN, DE, SK, CS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Translation Mode Selection */}
          <div className="space-y-2">
            <Label>Tryb tłumaczenia</Label>
            <Select value={translationMode} onValueChange={setTranslationMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fallback">Fallback (Primary → Secondary)</SelectItem>
                <SelectItem value="primary_only">Tylko klucz główny</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={runAutomaticTranslationAnalysis}
              disabled={autoProgress.isRunning || loading || untranslatedProducts.length === 0}
              className="flex items-center gap-2"
            >
              <PlayCircle className="h-4 w-4" />
              Automatyczna analiza i naprawa
              {untranslatedProducts.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {untranslatedProducts.length} produktów
                </Badge>
              )}
            </Button>
            
            <Button
              onClick={runTranslationVerificationTest}
              variant="outline"
              disabled={autoProgress.isRunning || loading || untranslatedProducts.length === 0}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              Test weryfikacyjny
            </Button>
          </div>

          {/* Auto Translation Progress */}
          {autoProgress.isRunning && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Automatyczne tłumaczenie w toku...</span>
                    <span className="text-sm text-muted-foreground">
                      {autoProgress.processedCount} / {autoProgress.totalCount}
                    </span>
                  </div>
                  
                  <Progress 
                    value={(autoProgress.processedCount / autoProgress.totalCount) * 100} 
                    className="w-full"
                  />
                  
                  {autoProgress.currentProduct && (
                    <div className="text-sm text-muted-foreground">
                      Obecnie: {autoProgress.currentProduct}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-green-600 font-medium">Sukces: {autoProgress.successCount}</span>
                    </div>
                    <div>
                      <span className="text-red-600 font-medium">Błędy: {autoProgress.errorCount}</span>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">
                        Pozostało: ~{Math.ceil(autoProgress.estimatedTimeRemaining / 1000)}s
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Untranslated Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Produkty wymagające tłumaczenia
            <Badge variant="secondary">{untranslatedProducts.length}</Badge>
          </CardTitle>
          <CardDescription>
            Lista produktów z niekompletnymi tłumaczeniami na wszystkie obsługiwane języki
          </CardDescription>
        </CardHeader>
        <CardContent>
          {untranslatedProducts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Wszystkie produkty przetłumaczone!
              </h3>
              <p className="text-gray-500">
                Wszystkie produkty mają kompletne tłumaczenia na wszystkie obsługiwane języki.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {untranslatedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    {getProductStatusIcon(product.status)}
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Nr seryjny: {product.serial_number}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {Math.round(product.translationProgress)}% ukończone
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Brakuje: {product.missingLanguages.join(', ').toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="w-24">
                      <Progress value={product.translationProgress} className="h-2" />
                    </div>
                    
                    <Button
                      onClick={() => translateSingleProduct(product)}
                      size="sm"
                      variant="outline"
                      disabled={autoProgress.isRunning || loading}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Tłumacz
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Translation Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Logi tłumaczeń
            <Badge variant="secondary">{translationLogs.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {translationLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(log.status)}
                  <div>
                    <div className="font-medium">
                      {log.field_name} → {log.target_language.toUpperCase()}
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(log.created_at).toLocaleString('pl-PL')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div>{log.characters_used} znaków</div>
                    <div className="text-muted-foreground">
                      {log.processing_time_ms}ms
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Szczegóły tłumaczenia</DialogTitle>
                        <DialogDescription>
                          {log.field_name} → {log.target_language.toUpperCase()} | {log.api_key_used}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Request:</Label>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(log.request_payload, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <Label>Response:</Label>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(log.response_payload, null, 2)}
                          </pre>
                        </div>
                        {log.error_details && (
                          <div>
                            <Label>Błąd:</Label>
                            <div className="text-sm text-red-600 bg-red-50 p-2 rounded mt-1">
                              {log.error_details}
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImprovedTranslationPanel;