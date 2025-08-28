import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, AlertCircle, Search } from 'lucide-react';
import { useDualApiTranslation } from '@/hooks/useDualApiTranslation';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  serial_number: string;
  short_description?: string;
  detailed_description?: string;
}

const ProductTranslationPanel: React.FC = () => {
  const { translateProductSpecifications, loading } = useDualApiTranslation();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [translationMode, setTranslationMode] = useState('fallback');
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

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

  const handleTranslateProduct = async () => {
    if (!selectedProductId) return;

    const result = await translateProductSpecifications(selectedProductId, translationMode);
    
    if (result && typeof result === 'object' && result.success) {
      console.log('Translation completed:', result.results);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Play className="h-5 w-5" />
          <span>Tłumaczenie specyfikacji produktów</span>
        </CardTitle>
        <CardDescription>
          Automatyczne tłumaczenie tylko pól specyfikacji (krótki opis + szczegółowy opis)
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
            <Label htmlFor="productSearch">Wyszukaj produkt</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="productSearch"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nazwa lub numer seryjny..."
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="productSelect">Wybierz produkt</Label>
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz produkt do tłumaczenia..." />
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

        {selectedProduct && (
          <div className="p-4 border rounded-md bg-muted/50">
            <h4 className="font-medium mb-2">Podgląd pól do tłumaczenia:</h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Krótki opis:</strong>
                <p className="text-muted-foreground truncate">
                  {selectedProduct.short_description || 'Brak'}
                </p>
              </div>
              <div>
                <strong>Szczegółowy opis:</strong>
                <p className="text-muted-foreground truncate">
                  {selectedProduct.detailed_description || 'Brak'}
                </p>
              </div>
            </div>
          </div>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Zakres tłumaczenia:</strong> Tylko krótki opis i szczegółowy opis (specyfikacje). 
            Nazwa produktu i inne pola nie są tłumaczone. Tłumaczenie na języki: EN, DE, FR, CS.
          </AlertDescription>
        </Alert>

        <Button
          onClick={handleTranslateProduct}
          disabled={loading || !selectedProductId}
          className="w-full"
          size="lg"
        >
          <Play className="h-4 w-4 mr-2" />
          {loading ? 'Tłumaczenie w toku...' : 'Przetłumacz specyfikacje produktu'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductTranslationPanel;