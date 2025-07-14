
import { Product } from '@/types';
import CompactProductTable from './CompactProductTable';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onCopy: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductList = ({ products, onEdit, onCopy, onDelete }: ProductListProps) => {
  return (
    <CompactProductTable 
      products={products}
      onEdit={onEdit}
      onCopy={onCopy}
      onDelete={onDelete}
    />
  );
};

export default ProductList;
