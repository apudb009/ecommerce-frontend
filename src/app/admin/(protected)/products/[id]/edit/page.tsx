import { Product } from '@/lib/types';
import { serverFetch } from '@/lib/server-api';
import ProductEditClient from '@/components/admin/product/Edit/ProductEditClient';

type Props = {
  params: Promise<{
    id: string;
  }>;
};
export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await serverFetch<Product>(`/products/admin/${id}`);

  return <ProductEditClient product={product} />;
}
