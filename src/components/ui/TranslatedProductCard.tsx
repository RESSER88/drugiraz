import { useLanguage } from '@/contexts/LanguageContext';
import { Product } from '@/types';
import { Link } from 'react-router-dom';
import { Badge } from './badge';
import OptimizedImage from './OptimizedImage';

interface TranslatedProduct extends Product {
  translatedName?: string;
  translatedShortDescription?: string;
  translatedDetailedDescription?: string;
}

interface TranslatedProductCardProps {
  product: TranslatedProduct;
}

const TranslatedProductCard: React.FC<TranslatedProductCardProps> = ({ product }) => {
  const { language } = useLanguage();

  const displayName = (language === 'pl' || !product.translatedName) 
    ? product.model 
    : product.translatedName;

  const displayDescription = (language === 'pl' || !product.translatedShortDescription) 
    ? product.shortDescription 
    : product.translatedShortDescription;

  return (
    <Link 
      to={`/product/${product.slug}`} 
      className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-stakerpol-orange overflow-hidden"
      aria-label={`Zobacz szczegóły ${displayName}`}
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
        <OptimizedImage
          src={product.image}
          alt={`Wózek widłowy ${displayName}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {product.specs?.condition && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 right-2 bg-white/90 text-stakerpol-navy font-medium"
          >
            {product.specs.condition}
          </Badge>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-stakerpol-navy group-hover:text-stakerpol-orange transition-colors line-clamp-1">
          {displayName}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {displayDescription}
        </p>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          {product.specs?.workingHours && (
            <div>
              <span className="text-muted-foreground">Godziny pracy:</span>
              <div className="font-medium">{product.specs.workingHours}</div>
            </div>
          )}
          
          {product.specs?.liftHeight && (
            <div>
              <span className="text-muted-foreground">Wys. podnoszenia:</span>
              <div className="font-medium">{product.specs.liftHeight}</div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default TranslatedProductCard;