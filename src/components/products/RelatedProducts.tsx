
import { Product } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/utils/translations';

interface RelatedProductsProps {
  currentProductId: string;
  products: Product[];
}

const RelatedProducts = ({ currentProductId, products }: RelatedProductsProps) => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  
  const relatedProducts = products
    .filter((p) => p.id !== currentProductId)
    .slice(0, 3);

  const handleProductClick = () => {
    // Smooth scroll to product details section when a related product is clicked
    setTimeout(() => {
      const productDetailsSection = document.getElementById('product-details');
      if (productDetailsSection) {
        productDetailsSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      } else {
        // Fallback to scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <section className="bg-gray-50 py-12">
      <div className="container-custom">
        <h2 className="text-2xl font-bold mb-6 animate-fade-in">{t('relatedProducts')}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {relatedProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="animate-fade-in" 
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={handleProductClick}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;
