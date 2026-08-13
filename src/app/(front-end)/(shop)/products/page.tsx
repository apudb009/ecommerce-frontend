import type { Metadata } from 'next';
import { buildMeta } from '@/lib/seo';
import Products from '@/components/shop/products';
import { serverFetch } from '@/lib/server-api';
import { PaginatedResponse, Product } from '@/lib/types';

export const metadata: Metadata = buildMeta({
  title: 'All Products',
  description: 'Browse our complete collection of products. Filter by category, price, and more.',
  url: '/products',
  keywords: ['products', 'shop', 'buy online'],
});

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const sp = await searchParams;

  const params = {
    page: sp.page ?? '1',
    limit: '12',
    search: sp.search,
    categoryId: sp.categoryId,
    minPrice: sp.minPrice,
    maxPrice: sp.maxPrice,
    inStock: sp.inStock,
    minRating: sp.minRating,
    variantValues: sp.variantValues,
    variantName: sp.variantName,
    colors: sp.colors,
    sortBy: sp.sortBy ?? 'createdAt',
    sortOrder: sp.sortOrder ?? 'desc',
  };

  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();

  const data = await serverFetch<PaginatedResponse<Product>>(`/products?${query}`, {
    revalidate: 60,
  }).catch(() => ({ data: [], meta: null }));

  return <Products products={data.data ?? []} meta={data.meta} />;
}
