import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  Play, 
  Settings, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  EyeOff,
  TestTube,
  Database,
  Activity
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
}

const TranslationManagementPanel: React.FC = () => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [translationLogs, setTranslationLogs] = useState<TranslationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [translationMode, setTranslationMode] = useState('fallback');
  const [newApiKey, setNewApiKey] = useState({ name: '', key: '', isPrimary: false });
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');

  // Load data on mount
  useEffect(() => {
    loadTranslationData();
  }, []);

  const loadTranslationData = async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('auto-translate', {
        body: { action: 'get_translation_stats' }
      });

      if (response.data?.success) {
        setApiKeys(response.data.apiKeys || []);
        setTranslationLogs(response.data.recentLogs || []);
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie można załadować danych tłumaczeń",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const testApiConnection = async (keyId: string) => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('auto-translate', {
        body: { action: 'test_connection', keyId }
      });

      if (response.data?.success) {
        toast({
          title: "Sukces",
          description: "Połączenie z API działa poprawnie"
        });
        loadTranslationData(); // Refresh data
      } else {
        toast({
          title: "Błąd połączenia",
          description: response.data?.error || "Test połączenia nieudany",
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

  const refreshUsage = async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('auto-translate', {
        body: { action: 'refresh_usage' }
      });

      if (response.data?.results) {
        toast({
          title: "Sukces",
          description: "Dane użycia zostały odświeżone"
        });
        loadTranslationData();
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie można odświeżyć danych użycia",
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
      // Simple base64 encoding for now (in production use proper encryption)
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
      loadTranslationData();
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie można dodać klucza API",
        variant: "destructive"
      });
    }
  };

  const translateProductSpecs = async () => {
    if (!selectedProductId) {
      toast({
        title: "Błąd",
        description: "Wybierz produkt do tłumaczenia",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Get product data
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', selectedProductId)
        .single();

      if (!product) {
        throw new Error('Produkt nie został znaleziony');
      }

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
          translationMode
        }
      });

      if (response.data?.success) {
        const successCount = response.data.results.filter((r: any) => r.success).length;
        const totalCount = response.data.results.length;

        toast({
          title: "Tłumaczenie zakończone",
          description: `Przetłumaczono ${successCount}/${totalCount} pól specyfikacji`
        });

        loadTranslationData();
      } else {
        throw new Error('Tłumaczenie nieudane');
      }
    } catch (error) {
      toast({
        title: "Błąd tłumaczenia",
        description: error.message || "Nie można przetłumaczyć specyfikacji",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
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
        return 'default';
      case 'error':
        return 'destructive';
      case 'quota_exceeded':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Zarządzanie tłumaczeniami AI</h2>
          <p className="text-muted-foreground">
            Panel kontrolny dla dual-API DeepL z szczegółowym monitoringiem
          </p>
        </div>
        <Button
          onClick={loadTranslationData}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Odśwież dane
        </Button>
      </div>

      {/* API Keys Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Zarządzanie kluczami API</span>
          </CardTitle>
          <CardDescription>
            Konfiguracja i monitoring dwóch kluczy DeepL API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current API Keys */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apiKeys.map((key) => (
              <Card key={key.id} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(key.status)}
                      <span className="font-medium">{key.name}</span>
                      {key.is_primary && (
                        <Badge variant="default" className="text-xs">PRIMARY</Badge>
                      )}
                    </div>
                    <Badge variant={getStatusVariant(key.status)}>
                      {key.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{key.api_key_masked}</p>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Wykorzystanie:</span>
                      <span>{key.quota_used?.toLocaleString() || 0} / {key.quota_limit?.toLocaleString() || 500000}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${Math.min((key.quota_used / key.quota_limit) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => testApiConnection(key.id)}
                      size="sm"
                      variant="outline"
                      disabled={loading}
                    >
                      <TestTube className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  </div>
                  
                  {key.last_sync_at && (
                    <p className="text-xs text-muted-foreground">
                      Ostatnia synchronizacja: {new Date(key.last_sync_at).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Add New API Key */}
          <div>
            {!showNewKeyForm ? (
              <Button
                onClick={() => setShowNewKeyForm(true)}
                variant="outline"
                size="sm"
              >
                Dodaj klucz API
              </Button>
            ) : (
              <div className="space-y-3 p-4 border rounded-md">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="keyName">Nazwa klucza</Label>
                    <Input
                      id="keyName"
                      value={newApiKey.name}
                      onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="np. Primary DeepL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="apiKey">Klucz API</Label>
                    <Input
                      id="apiKey"
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
                  <Button onClick={addApiKey} size="sm">
                    Dodaj klucz
                  </Button>
                  <Button
                    onClick={() => setShowNewKeyForm(false)}
                    variant="outline"
                    size="sm"
                  >
                    Anuluj
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={refreshUsage}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <Activity className="h-4 w-4 mr-2" />
            Odśwież dane użycia
          </Button>
        </CardContent>
      </Card>

      {/* Translation Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Konfiguracja tłumaczeń</span>
          </CardTitle>
          <CardDescription>
            Tryb pracy dual-API i tłumaczenie specyfikacji produktów
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="translationMode">Tryb tłumaczenia</Label>
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
              <p className="text-sm text-muted-foreground mt-1">
                {translationMode === 'fallback' && 'Użyj primary → fallback do secondary'}
                {translationMode === 'primary_only' && 'Tylko klucz główny'}
                {translationMode === 'sequential' && 'Sekwencyjnie przez oba API'}
              </p>
            </div>

            <div>
              <Label htmlFor="productSelect">Wybierz produkt</Label>
              <Input
                id="productSelect"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                placeholder="UUID produktu"
              />
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Tłumaczeniu podlegają tylko: krótki opis i szczegółowy opis (specyfikacje). 
              Nazwa produktu nie jest tłumaczona.
            </AlertDescription>
          </Alert>

          <Button
            onClick={translateProductSpecs}
            disabled={loading || !selectedProductId}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            Przetłumacz specyfikacje produktu
          </Button>
        </CardContent>
      </Card>

      {/* Translation Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Szczegółowe logi tłumaczeń</CardTitle>
          <CardDescription>
            Ostatnie 20 operacji tłumaczenia z pełnymi szczegółami
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {translationLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 border rounded-md text-sm"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(log.status)}
                  <div>
                    <div className="font-medium">
                      {log.field_name} ({log.source_language.toUpperCase()} → {log.target_language.toUpperCase()})
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Produkt: {log.product_id.slice(0, 8)}... | API: {log.api_key_used}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-right">
                  <Badge variant={getStatusVariant(log.status)}>
                    {log.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {log.characters_used} zn. | {log.processing_time_ms}ms
                  </span>
                </div>
              </div>
            ))}

            {translationLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Brak logów tłumaczeń
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranslationManagementPanel;