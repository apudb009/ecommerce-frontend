import type { Metadata } from 'next';
import { buildMeta } from '@/lib/seo';
import ProductDetail from '@/components/shop/ProductDetail';
import { serverFetch } from '@/lib/server-api';
import { Product } from '@/lib/types';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return buildMeta({
        title: 'Product Not Found',
        description: 'This product could not be found.',
        noIndex: true,
      });
    }

    const product = await res.json();

    return buildMeta({
      title: product.name,
      description:
        product.description ||
        `Buy ${product.name} at the best price. ${product._count?.reviews || 0} reviews.`,
      image: product.images?.[0].url,
      url: `/products/${slug}`,
      type: 'website',
      keywords: [product.name, product.category?.name, 'buy online'].filter(Boolean),
    });
  } catch {
    return buildMeta({
      title: 'Product',
      description: 'Shop our products.',
    });
  }
}

async function fetchProduct(slug: string) {
  const product = await serverFetch<Product>(`/products/${slug}`);
  return product;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  return <ProductDetail product={product} slug={slug} />;
}
