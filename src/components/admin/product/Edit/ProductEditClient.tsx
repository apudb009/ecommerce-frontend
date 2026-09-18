'use client';

import { Product } from '@/lib/types';
import ProductForm from '@/components/admin/ProductForm';

type Props = {
  product: Product;
};

export default function ProductEditClient({ product }: Props) {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Product</h1>
      <ProductForm product={product} />
    </div>
  );
}
