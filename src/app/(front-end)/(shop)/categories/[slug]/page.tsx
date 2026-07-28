import type { Metadata } from 'next';
import { buildMeta } from '@/lib/seo';
import Category from '@/components/shop/Category';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${slug}`);
    const data = await res.json();
    const cat = data;

    return buildMeta({
      title: cat.name,
      description:
        cat.description || `Shop ${cat.name} products. ${data.meta?.total || 0} available.`,
      image: cat.image || undefined,
      url: `/categories/${slug}`,
      keywords: [cat.name, 'buy online'],
    });
  } catch {
    return buildMeta({
      title: 'Category',
      description: 'Browse products in this category.',
    });
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  return <Category slug={slug} />;
}
