import type { Metadata } from 'next';
import { buildMeta } from '@/lib/seo';
import Products from '@/components/shop/products';

export const metadata: Metadata = buildMeta({
  title: 'All Products',
  description: 'Browse our complete collection of products. Filter by category, price, and more.',
  url: '/products',
  keywords: ['products', 'shop', 'buy online'],
});

export default function ProductsPage() {
  return <Products />;
}
