import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Settings, BarChart3, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import AdminLogin from '@/components/admin/AdminLogin';
import ProductManager from '@/components/admin/ProductManager';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useMigrationMonitor } from '@/hooks/useMigrationMonitor';
import TranslationStatsPanel from '@/components/admin/TranslationStatsPanel';
import ImageStatusTable from '@/components/admin/ImageStatusTable';

const Admin = () => {
  const { user, loading: authLoading, isAdmin, adminLoading, signOut } = useSupabaseAuth();
  const { 
    products, 
    isLoading: productsLoading, 
    addProduct, 
    updateProduct, 
    deleteProduct 
  } = useSupabaseProducts();
  
  // Migration monitoring
  const { stats: migrationStats, isMonitoring, completeMigration } = useMigrationMonitor(products || []);
  
  // ProductManager state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  
  // Translation stats panel state
  const [isTranslationStatsOpen, setIsTranslationStatsOpen] = useState(false);
  
  const { toast } = useToast();

  // ProductManager handlers - Fixed defaultNewProduct with correct Product interface properties
  const defaultNewProduct: Product = {
    id: '',
    model: '',
    image: '', // First image URL for backward compatibility
    images: [], // Array of image URLs
    shortDescription: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    specs: {
      // Main section (always visible)
      productionYear: new Date().getFullYear().toString(),
      serialNumber: '',
      mastLiftingCapacity: '0',
      preliminaryLiftingCapacity: '0',
      workingHours: '0',
      liftHeight: '0',
      minHeight: '0',
      preliminaryLifting: '',
      battery: '',
      condition: 'bardzo-dobry',
      
      // Expandable section (hidden by default)
      driveType: '',
      mast: '',
      freeStroke: '0',
      dimensions: '',
      wheels: '',
      operatorPlatform: '',
      additionalOptions: '',
      additionalDescription: '',
      
      // Legacy fields for backward compatibility
      capacity: '0',
      charger: ''
    }
  };

  const handleEdit = (product: Product) => {
    console.log('Editing product:', product);
    setSelectedProduct(product);
    setProductImages(product.images || []);
    setIsEditDialogOpen(true);
  };

  const handleAdd = () => {
    console.log('Adding new product');
    setSelectedProduct(defaultNewProduct);
    setProductImages([]);
    setIsEditDialogOpen(true);
  };

  const handleCopy = (product: Product) => {
    console.log('Copying product:', product);
    const copiedProduct = {
      ...product,
      id: '',
      model: `${product.model} (kopia)`,
      specs: {
        ...product.specs,
        serialNumber: `${product.specs.serialNumber}-COPY`
      }
    };
    setSelectedProduct(copiedProduct);
    setProductImages(product.images || []);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (window.confirm(`Czy na pewno chcesz usunąć produkt "${product.model}"?`)) {
      try {
        await deleteProduct(product.id);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="absolute top-4 right-4">
          {user && (
            <Button variant="outline" onClick={signOut}>
              Wyloguj
            </Button>
          )}
        </div>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-stakerpol-orange mx-auto mb-4" />
          <p className="text-gray-600">
            {authLoading ? 'Sprawdzanie uprawnień...' : 'Weryfikacja roli administratora...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-stakerpol-navy mb-2">
                Panel Administracyjny
              </h1>
              <p className="text-gray-600">
                Zarządzanie produktami i systemem
              </p>
            </div>
            <Button variant="outline" onClick={signOut}>
              Wyloguj
            </Button>
          </div>
          
          {/* Enhanced Migration Status Card */}
          <div className="mt-4 p-4 border rounded-lg bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {migrationStats.isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                )}
                <div>
                  <h3 className="font-semibold">
                    Status migracji obrazów: {migrationStats.migrationProgress}%
                  </h3>
                  <p className="text-sm text-gray-600">
                    {migrationStats.isCompleted 
                      ? `Wszystkie ${migrationStats.storageImages} obrazów w Supabase Storage`
                      : `${migrationStats.base64Images} obrazów do migracji, ${migrationStats.storageImages} już przeniesione`
                    }
                  </p>
                </div>
              </div>
              
              {!migrationStats.isCompleted && (
                <Button 
                  onClick={completeMigration} 
                  className="cta-button"
                  disabled={isMonitoring}
                >
                  {isMonitoring ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Migracja...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Dokończ migrację
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produkty
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Statystyki
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Ustawienia
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductManager
              isEditDialogOpen={isEditDialogOpen}
              setIsEditDialogOpen={setIsEditDialogOpen}
              selectedProduct={selectedProduct}
              productImages={productImages}
              setProductImages={setProductImages}
              products={products}
              defaultNewProduct={defaultNewProduct}
              handleEdit={handleEdit}
              handleAdd={handleAdd}
              handleCopy={handleCopy}
              handleDelete={handleDelete}
              addProduct={addProduct}
              updateProduct={updateProduct}
            />
          </TabsContent>


          <TabsContent value="stats">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Produkty</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-stakerpol-navy mb-2">
                    {products?.length || 0}
                  </div>
                  <p className="text-gray-600">Całkowita liczba produktów</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Obrazy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Base64:</span>
                      <Badge variant={migrationStats.base64Images > 0 ? "destructive" : "secondary"}>
                        {migrationStats.base64Images}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Storage:</span>
                      <Badge variant="default">
                        {migrationStats.storageImages}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              {/* Image Status and Migration */}
              <ImageStatusTable 
                products={products || []}
                isMonitoring={isMonitoring}
                completeMigration={completeMigration}
              />

              {/* Translation Stats Panel */}
              <TranslationStatsPanel 
                isOpen={isTranslationStatsOpen}
                onOpenChange={setIsTranslationStatsOpen}
              />

              {/* System Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Ustawienia systemu</CardTitle>
                  <CardDescription>
                    Konfiguracja podstawowych usług
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Supabase Storage</h3>
                        <p className="text-sm text-muted-foreground">
                          Bucket 'product-images' skonfigurowany
                        </p>
                      </div>
                      <Badge variant="default">Aktywny</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Realtime Sync</h3>
                        <p className="text-sm text-muted-foreground">
                          Synchronizacja w czasie rzeczywistym
                        </p>
                      </div>
                      <Badge variant="default">Włączony</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
