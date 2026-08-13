import { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import { PackageX } from 'lucide-react';

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <PackageX className="mb-3 h-12 w-12 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-700">No products found</h3>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search term</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}
