import React from 'react';
import { Product } from '@/types';
import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';
import { Badge } from './badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProductTranslations } from '@/hooks/useProductTranslations';

interface TranslatedProductCardProps {
  product: Product;
}

const TranslatedProductCard: React.FC<TranslatedProductCardProps> = ({ product }) => {
  const { language } = useLanguage();
  const { getProductTranslation } = useProductTranslations(language);

  const translatedName = getProductTranslation(product.id, 'model', product.model);
  const translatedDescription = getProductTranslation(product.id, 'shortDescription', product.shortDescription || '');

  return (
    <Link to={`/produkt/${product.slug}`} className="group block">
      <div className="card-shadow rounded-lg overflow-hidden bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
        <div className="relative overflow-hidden">
          <OptimizedImage
            src={product.image || '/placeholder.svg'}
            alt={`${translatedName} - Toyota BT paleciak elektryczny`}
            className="w-full h-48 object-contain group-hover:scale-105 transition-transform duration-300 bg-gray-50"
            priority={false}
          />
          {product.specs.condition && (
            <Badge 
              variant={product.specs.condition === 'nowy' ? 'default' : 'secondary'}
              className="absolute top-2 right-2 bg-white/90 text-stakerpol-navy"
            >
              {product.specs.condition}
            </Badge>
          )}
        </div>
        
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg text-stakerpol-navy mb-2 group-hover:text-stakerpol-orange transition-colors line-clamp-2">
            {translatedName}
          </h3>
          
          {translatedDescription && (
            <p className="text-gray-600 text-sm mb-3 flex-1 line-clamp-3">
              {translatedDescription}
            </p>
          )}
          
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-auto">
            {product.specs.productionYear && (
              <div>
                <span className="font-medium">Rok:</span> {product.specs.productionYear}
              </div>
            )}
            {product.specs.workingHours && (
              <div>
                <span className="font-medium">Mth:</span> {product.specs.workingHours}
              </div>
            )}
            {product.specs.liftHeight && (
              <div>
                <span className="font-medium">Wys. podn.:</span> {product.specs.liftHeight}
              </div>
            )}
            {product.specs.mastLiftingCapacity && (
              <div>
                <span className="font-medium">Udźwig:</span> {product.specs.mastLiftingCapacity}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TranslatedProductCard;