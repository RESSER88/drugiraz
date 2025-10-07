import { Product } from '@/types';
import { testimonials } from '@/data/testimonials/testimonialsData';

export interface ProductSchemaData {
  "@context": string;
  "@type": string;
  name: string;
  brand: {
    "@type": string;
    name: string;
  };
  model: string;
  sku: string;
  description: string;
  url: string;
  image: string[];
  manufacturer: {
    "@type": string;
    name: string;
  };
  category: string;
  additionalProperty: Array<{
    "@type": string;
    name: string;
    value: string;
    unitCode?: string;
  }>;
  review: Array<{
    "@type": string;
    author: {
      "@type": string;
      name: string;
    };
    reviewBody: string;
    reviewRating: {
      "@type": string;
      ratingValue: number;
      bestRating: number;
    };
    publisher: {
      "@type": string;
      name: string;
    };
  }>;
  aggregateRating: {
    "@type": string;
    ratingValue: number;
    reviewCount: number;
    bestRating: number;
    worstRating: number;
  };
  offers: {
    "@type": string;
    availability: string;
    priceValidUntil: string;
    businessFunction: string;
    seller: {
      "@type": string;
      name: string;
      url: string;
      telephone: string;
    };
  };
  productionDate?: string;
}

const getBrand = (product: Product) => {
  const model = product.model?.toLowerCase() || '';
  if (model.includes('toyota') || model.includes('bt')) return 'Toyota';
  return 'Toyota'; // Default to Toyota as most products are Toyota
};

const getModelName = (product: Product) => {
  const model = product.model || '';
  // Extract model number (like SWE200D) from full name
  const modelMatch = model.match(/SWE\d+\w*/i) || model.match(/BT\w+\d+/i);
  return modelMatch ? modelMatch[0] : model;
};

const getAllImages = (product: Product) => {
  const images = [];
  if (product.image) images.push(product.image);
  if (product.images) images.push(...product.images);
  return [...new Set(images)]; // Remove duplicates
};

const getAdditionalProperties = (product: Product) => {
  const properties: Array<{
    "@type": string;
    name: string;
    value: string;
    unitCode?: string;
  }> = [];
  
  if (product.specs?.liftHeight) {
    properties.push({
      "@type": "PropertyValue",
      "name": "Wysokość podnoszenia",
      "value": `${product.specs.liftHeight} mm`,
      "unitCode": "MMT" // Millimeter
    });
  }
  
  if (product.specs?.mastLiftingCapacity) {
    properties.push({
      "@type": "PropertyValue", 
      "name": "Udźwig na maszcie",
      "value": `${product.specs.mastLiftingCapacity} kg`,
      "unitCode": "KGM" // Kilogram
    });
  }
  
  if (product.specs?.preliminaryLiftingCapacity) {
    properties.push({
      "@type": "PropertyValue",
      "name": "Udźwig przy podnoszeniu wstępnym", 
      "value": `${product.specs.preliminaryLiftingCapacity} kg`,
      "unitCode": "KGM" // Kilogram
    });
  }
  
  if (product.specs?.workingHours) {
    properties.push({
      "@type": "PropertyValue",
      "name": "Motogodziny",
      "value": `${product.specs.workingHours} mth`,
      "unitCode": "HUR" // Hour
    });
  }
  
  if (product.specs?.productionYear) {
    properties.push({
      "@type": "PropertyValue",
      "name": "Rok produkcji",
      "value": product.specs.productionYear.toString()
    });
  }
  
  if (product.specs?.condition) {
    properties.push({
      "@type": "PropertyValue",
      "name": "Stan",
      "value": product.specs.condition
    });
  }

  if (product.specs?.driveType) {
    properties.push({
      "@type": "PropertyValue",
      "name": "Typ napędu",
      "value": product.specs.driveType
    });
  }

  // Applications / Zastosowania - Limited to 2 key applications (not 8!)
  const applications = [
    'Magazyny i centra dystrybucyjne',
    'Zakłady produkcyjne'
  ];

  applications.forEach((app) => {
    properties.push({
      "@type": "PropertyValue",
      "name": "Zastosowanie",
      "value": app
    });
  });

  return properties;
};

const getReviewsData = () => {
  const reviews = testimonials.map((testimonial) => ({
    "@type": "Review" as const,
    "author": {
      "@type": "Person" as const,
      "name": testimonial.name
    },
    "reviewBody": testimonial.content,
    "reviewRating": {
      "@type": "Rating" as const,
      "ratingValue": testimonial.rating,
      "bestRating": 5
    },
    "publisher": {
      "@type": "Organization" as const, 
      "name": testimonial.company || "Stakerpol"
    }
  }));

  const totalRating = testimonials.reduce((sum, t) => sum + t.rating, 0);
  const averageRating = Math.round((totalRating / testimonials.length) * 10) / 10;

  return {
    reviews,
    aggregateRating: {
      "@type": "AggregateRating" as const,
      "ratingValue": averageRating,
      "reviewCount": testimonials.length,
      "bestRating": 5,
      "worstRating": 1
    }
  };
};

const getCurrentUrl = (product: Product) => {
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return `https://stakerpol.pl/products/${product.slug || product.id}`;
};

const getPriceValidUntil = () => {
  const now = new Date();
  const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  return nextYear.toISOString().split('T')[0]; // Format: YYYY-MM-DD
};

export const generateProductSchema = (product: Product): ProductSchemaData => {
  const reviewsData = getReviewsData();
  
  const schema: ProductSchemaData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.model,
    "brand": {
      "@type": "Brand",
      "name": getBrand(product)
    },
    "model": getModelName(product),
    "sku": product.specs?.serialNumber || product.id,
    "description": product.shortDescription || product.specs?.additionalDescription || `Wózek widłowy ${product.model}`,
    "url": getCurrentUrl(product),
    "image": getAllImages(product),
    "manufacturer": {
      "@type": "Organization",
      "name": getBrand(product)
    },
    "category": "Wózki widłowe",
    "additionalProperty": getAdditionalProperties(product),
    "review": reviewsData.reviews,
    "aggregateRating": reviewsData.aggregateRating,
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": getPriceValidUntil(), // Dynamic: 1 year from now
      "businessFunction": "https://schema.org/Sell",
      "seller": {
        "@type": "Organization",
        "name": "Stakerpol",
        "url": "https://stakerpol.pl",
        "telephone": "+48694133592"
      }
    }
  };

  // Add production year if available
  if (product.specs?.productionYear) {
    schema.productionDate = product.specs.productionYear.toString();
  }

  return schema;
};
