
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { products as initialProducts } from '@/data/products/productsData';
import { Product } from '@/types';

// Migration function to add new specification fields and ensure backward compatibility
const migrateProduct = (product: any): Product => {
  return {
    ...product,
    images: product.images || [product.image].filter(Boolean),
    specs: {
      // Main section - handle split capacity field
      productionYear: product.specs?.productionYear || '',
      mastLiftingCapacity: product.specs?.mastLiftingCapacity || product.specs?.capacity || '',
      preliminaryLiftingCapacity: product.specs?.preliminaryLiftingCapacity || '',
      workingHours: product.specs?.workingHours || '',
      liftHeight: product.specs?.liftHeight || '',
      minHeight: product.specs?.minHeight || '',
      preliminaryLifting: product.specs?.preliminaryLifting || '',
      battery: product.specs?.battery || '',
      condition: product.specs?.condition || '',
      serialNumber: product.specs?.serialNumber || '',
      
      // Expandable section
      driveType: product.specs?.driveType || '',
      mast: product.specs?.mast || '',
      freeStroke: product.specs?.freeStroke || '',
      dimensions: product.specs?.dimensions || '',
      wheels: product.specs?.wheels || '',
      operatorPlatform: product.specs?.operatorPlatform || '',
      additionalOptions: product.specs?.additionalOptions || '',
      additionalDescription: product.specs?.additionalDescription || '',
      
      // Legacy compatibility
      capacity: product.specs?.capacity || '',
      charger: product.specs?.charger || ''
    },
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || new Date().toISOString()
  };
};

interface ProductState {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  resetToInitial: () => void;
  getFeaturedProducts: (count?: number) => Product[];
  getRecentProducts: (count?: number) => Product[];
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: initialProducts.map(migrateProduct),
      
      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, {
            ...product,
            image: product.images?.[0] || product.image,
            images: product.images || [product.image].filter(Boolean),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }]
        })),
      
      updateProduct: (product) =>
        set((state) => ({
          products: state.products.map((p) => 
            p.id === product.id ? {
              ...product,
              image: product.images?.[0] || product.image,
              images: product.images || [product.image].filter(Boolean),
              updatedAt: new Date().toISOString()
            } : p
          )
        })),
      
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id)
        })),
      
      resetToInitial: () => 
        set(() => ({
          products: initialProducts.map(migrateProduct)
        })),

      getFeaturedProducts: (count = 3) => {
        const { products } = get();
        if (products.length === 0) return [];
        
        const sortedByDate = [...products].sort((a, b) => 
          new Date(b.updatedAt || b.createdAt || 0).getTime() - 
          new Date(a.updatedAt || a.createdAt || 0).getTime()
        );
        
        const recent = sortedByDate.slice(0, Math.min(2, count));
        const remaining = sortedByDate.slice(2);
        
        if (remaining.length > 0 && recent.length < count) {
          const randomIndex = Math.floor(Math.random() * remaining.length);
          recent.push(remaining[randomIndex]);
        }
        
        while (recent.length < count && recent.length < products.length) {
          const nextProduct = sortedByDate.find(p => !recent.includes(p));
          if (nextProduct) recent.push(nextProduct);
          else break;
        }
        
        return recent.slice(0, count);
      },

      getRecentProducts: (count = 3) => {
        const { products } = get();
        return [...products]
          .sort((a, b) => 
            new Date(b.updatedAt || b.createdAt || 0).getTime() - 
            new Date(a.updatedAt || a.createdAt || 0).getTime()
          )
          .slice(0, count);
      }
    }),
    {
      name: 'product-store',
      version: 3
    }
  )
);
