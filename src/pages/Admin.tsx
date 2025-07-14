import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Settings, Image, Users, BarChart3, Wrench, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import AdminLogin from '@/components/admin/AdminLogin';
import ProductManager from '@/components/admin/ProductManager';
import ImageMigrationTool from '@/components/admin/ImageMigrationTool';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useMigrationMonitor } from '@/hooks/useMigrationMonitor';

const Admin = () => {
  const { user, loading: authLoading, isAdmin, adminLoading } = useSupabaseAuth();
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
          <h1 className="text-3xl font-bold text-stakerpol-navy mb-2">
            Panel Administracyjny
          </h1>
          <p className="text-gray-600">
            Zarządzanie produktami i systemem
          </p>
          
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produkty
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Migracja zdjęć
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

          <TabsContent value="images">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Status obrazów
                  </CardTitle>
                  <CardDescription>
                    Aktualne statystyki przechowywania obrazów produktów
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-stakerpol-navy">{migrationStats.totalImages}</div>
                      <div className="text-sm text-gray-600">Obrazów ogółem</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{migrationStats.base64Images}</div>
                      <div className="text-sm text-gray-600">Obrazów base64</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{migrationStats.storageImages}</div>
                      <div className="text-sm text-gray-600">W Storage</div>
                    </div>
                  </div>
                  
                  {migrationStats.base64Images > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Wrench className="h-4 w-4 text-yellow-600" />
                        <span className="font-semibold text-yellow-800">
                          Migracja w toku
                        </span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        Znaleziono {migrationStats.base64Images} obrazów do migracji. 
                        Kliknij "Dokończ migrację" aby przenieść je do Supabase Storage.
                      </p>
                    </div>
                  )}

                  {migrationStats.isCompleted && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-800">
                          Wszystkie obrazy są już w Supabase Storage!
                        </span>
                      </div>
                      <p className="text-sm text-green-700">
                        Migracja została ukończona. Wszystkie obrazy są teraz serwowane z CDN.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <ImageMigrationTool />
            </div>
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
            <Card>
              <CardHeader>
                <CardTitle>Ustawienia systemu</CardTitle>
                <CardDescription>
                  Konfiguracja i zarządzanie systemem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Supabase Storage</h3>
                      <p className="text-sm text-gray-600">
                        Bucket 'product-images' skonfigurowany
                      </p>
                    </div>
                    <Badge variant="default">Aktywny</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Realtime Sync</h3>
                      <p className="text-sm text-gray-600">
                        Synchronizacja w czasie rzeczywistym
                      </p>
                    </div>
                    <Badge variant="default">Włączony</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
