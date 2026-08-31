import type { Metadata } from 'next';
import { buildMeta } from '@/lib/seo';
import Category from '@/components/shop/Category';
import { serverFetch } from '@/lib/server-api';
import { Category as CategoryType, PaginatedResponse } from '@/lib/types';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    //const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${slug}`);
    const cat = await serverFetch<CategoryType>(`/categories/${slug}`, {
      revalidate: 3600,
      tags: [`categories:${slug}`],
    });

    return buildMeta({
      title: cat.name,
      description:
        cat.description || `Shop ${cat.name} products. ${cat._count?.products || 0} available.`,
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
