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
  Search
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

const EnhancedTranslationPanel: React.FC = () => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [translationLogs, setTranslationLogs] = useState<TranslationLog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [queueProcessing, setQueueProcessing] = useState(false);
  const [translationMode, setTranslationMode] = useState('fallback');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLogDetails, setShowLogDetails] = useState<TranslationLog | null>(null);
  const [newApiKey, setNewApiKey] = useState({ name: '', key: '', isPrimary: false });
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadApiKeys(),
        loadTranslationLogs(),
        loadProducts()
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

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, serial_number, short_description, detailed_description')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
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

  const startQueueTranslation = async () => {
    if (!selectedProductId) {
      toast({
        title: "Błąd",
        description: "Wybierz produkt do tłumaczenia",
        variant: "destructive"
      });
      return;
    }

    setQueueProcessing(true);
    const languages = ['en', 'de', 'fr', 'cs'];
    let successCount = 0;
    let totalCount = 0;

    try {
      const product = products.find(p => p.id === selectedProductId);
      if (!product) {
        throw new Error('Produkt nie został znaleziony');
      }

      toast({
        title: "Kolejka rozpoczęta",
        description: `Tłumaczenie produktu na ${languages.length} języków...`,
      });

      for (const lang of languages) {
        try {
          totalCount++;
          
          const productContent = {
            shortDescription: product.short_description,
            specs: {
              additionalDescription: product.detailed_description
            }
          };

          const response = await supabase.functions.invoke('auto-translate', {
            body: {
              action: 'translate_product_specifications',
              productId: selectedProductId,
              productContent,
              translationMode,
              targetLanguage: lang
            }
          });

          if (response.data?.success) {
            successCount++;
            toast({
              title: `Język ${lang.toUpperCase()}`,
              description: "Tłumaczenie zakończone pomyślnie",
            });
          } else {
            toast({
              title: `Błąd ${lang.toUpperCase()}`,
              description: response.data?.error || "Tłumaczenie nieudane",
              variant: "destructive"
            });
          }

          // Opóźnienie między językami
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          toast({
            title: `Błąd ${lang.toUpperCase()}`,
            description: error.message,
            variant: "destructive"
          });
        }
      }

      toast({
        title: "Kolejka zakończona",
        description: `Przetłumaczono ${successCount}/${totalCount} języków`,
        variant: successCount === totalCount ? "default" : "destructive"
      });

      await loadTranslationLogs();

    } catch (error) {
      toast({
        title: "Błąd kolejki",
        description: error.message || "Proces kolejkowy się nie powiódł",
        variant: "destructive"
      });
    }
    
    setQueueProcessing(false);
  };

  const runFullTest = async () => {
    if (!selectedProductId) {
      toast({
        title: "Błąd",
        description: "Wybierz produkt do testowania",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const product = products.find(p => p.id === selectedProductId);
      if (!product) {
        throw new Error('Produkt nie został znaleziony');
      }

      toast({
        title: "Test pełny rozpoczęty",
        description: "Weryfikacja procesu tłumaczenia na wszystkie języki...",
      });

      // Test tłumaczenia
      await startQueueTranslation();

      // Weryfikacja zapisanych danych
      const { data: translations } = await supabase
        .from('product_translations')
        .select('*')
        .eq('product_id', selectedProductId);

      const languages = ['en', 'de', 'fr', 'cs'];
      const expectedTranslations = languages.length * 2; // 2 pola na język

      if (translations && translations.length >= expectedTranslations * 0.8) {
        toast({
          title: "Test zakończony ✅",
          description: `Zapisano ${translations.length}/${expectedTranslations} tłumaczeń. Test przeszedł pomyślnie!`,
        });
      } else {
        toast({
          title: "Test częściowo nieudany ⚠️",
          description: `Zapisano tylko ${translations?.length || 0}/${expectedTranslations} tłumaczeń.`,
          variant: "destructive"
        });
      }

    } catch (error) {
      toast({
        title: "Test nieudany ❌",
        description: error.message || "Test nie powiódł się",
        variant: "destructive"
      });
    }

    setLoading(false);
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tłumaczenia AI - Panel administracyjny</h2>
          <p className="text-muted-foreground">
            Zarządzanie dual-API DeepL z automatycznym procesem kolejkowym
          </p>
        </div>
        <Button
          onClick={loadData}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Odśwież wszystko
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
                  size="sm"
                  variant="outline"
                  disabled={loading}
                  className="flex-1"
                >
                  <TestTube className="h-3 w-3 mr-1" />
                  Test połączenia
                </Button>
                <Button
                  onClick={refreshQuota}
                  size="sm"
                  variant="outline"
                  disabled={loading}
                  className="flex-1"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Odśwież quota
                </Button>
              </div>
              
              {key.last_test_at && (
                <p className="text-xs text-muted-foreground">
                  Ostatni test: {new Date(key.last_test_at).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add API Key Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Zarządzanie kluczami API</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showNewKeyForm ? (
            <Button
              onClick={() => setShowNewKeyForm(true)}
              variant="outline"
            >
              Dodaj nowy klucz API
            </Button>
          ) : (
            <div className="space-y-4 p-4 border rounded-md">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Nazwa klucza</Label>
                  <Input
                    value={newApiKey.name}
                    onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="np. Primary DeepL"
                  />
                </div>
                <div>
                  <Label>Klucz API</Label>
                  <Input
                    type="password"
                    value={newApiKey.key}
                    onChange={(e) => setNewApiKey(prev => ({ ...prev, key: e.target.value }))}
                    placeholder="Wklej klucz DeepL API"
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
                <Button onClick={addApiKey}>Dodaj klucz</Button>
                <Button onClick={() => setShowNewKeyForm(false)} variant="outline">
                  Anuluj
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Translation Process Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Automatyczny proces tłumaczenia</span>
          </CardTitle>
          <CardDescription>
            Kolejkowe tłumaczenie na wszystkie języki z monitoringiem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tryb tłumaczenia</Label>
              <Select value={translationMode} onValueChange={setTranslationMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary_only">Primary Only</SelectItem>
                  <SelectItem value="fallback">Fallback (zalecane)</SelectItem>
                  <SelectItem value="sequential">Sequential</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Wyszukaj produkt</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nazwa lub numer..."
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Wybierz produkt</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz produkt..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {filteredProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.serial_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Automatyczny proces:</strong> Tłumaczenie kolejkowe na języki EN, DE, FR, CS.
              Każdy język przetwarzany osobno z opóźnieniem 1s między żądaniami.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={startQueueTranslation}
              disabled={queueProcessing || !selectedProductId}
              className="w-full"
              size="lg"
            >
              {queueProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kolejka w toku...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Przetłumacz specyfikacje
                </>
              )}
            </Button>
            
            <Button
              onClick={runFullTest}
              disabled={loading || !selectedProductId}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Test pełnego procesu
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Translation Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Logi tłumaczeń</span>
            <Badge variant="outline">{translationLogs.length}</Badge>
          </CardTitle>
          <CardDescription>
            Historia operacji z podglądem request/response
          </CardDescription>
        </CardHeader>
        <CardContent>
          {translationLogs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Brak logów tłumaczeń</p>
              <p className="text-sm text-muted-foreground">
                Uruchom proces tłumaczenia, aby zobaczyć logi
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {translationLogs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(log.status)}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-sm">{log.field_name}</p>
                          <Badge variant="outline" className="text-xs">
                            {log.source_language.toUpperCase()} → {log.target_language.toUpperCase()}
                          </Badge>
                          <Badge variant={getStatusVariant(log.status)} className="text-xs">
                            {log.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
                          <span>ID: {log.product_id.slice(0, 8)}...</span>
                          <span>API: {log.api_key_used}</span>
                          <span>Tryb: {log.translation_mode}</span>
                          <span>{log.characters_used} znaków</span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{log.processing_time_ms}ms</span>
                          <span>{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                        
                        {log.error_details && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                            <strong>Błąd:</strong> {log.error_details}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Szczegóły loga tłumaczenia</DialogTitle>
                          <DialogDescription>
                            Pełne informacje o operacji tłumaczenia
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong>ID:</strong> {log.id}</div>
                            <div><strong>Product ID:</strong> {log.product_id}</div>
                            <div><strong>Pole:</strong> {log.field_name}</div>
                            <div><strong>Język:</strong> {log.source_language} → {log.target_language}</div>
                            <div><strong>Status:</strong> {log.status}</div>
                            <div><strong>API Key:</strong> {log.api_key_used}</div>
                            <div><strong>Tryb:</strong> {log.translation_mode}</div>
                            <div><strong>Znaki:</strong> {log.characters_used}</div>
                            <div><strong>Czas:</strong> {log.processing_time_ms}ms</div>
                            <div><strong>Data:</strong> {new Date(log.created_at).toLocaleString()}</div>
                          </div>
                          
                          {log.request_payload && (
                            <div>
                              <strong>Request:</strong>
                              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                                {JSON.stringify(log.request_payload, null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          {log.response_payload && (
                            <div>
                              <strong>Response:</strong>
                              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                                {JSON.stringify(log.response_payload, null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          {log.error_details && (
                            <div>
                              <strong>Błąd:</strong>
                              <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTranslationPanel;