import { Category } from '@/lib/types';
import { serverFetch } from '@/lib/server-api';
import CategoryClient from '@/components/admin/category/CategoryClient';

export default async function AdminCategoriesPage() {
  const categories = await serverFetch<Category[]>('/categories');

  return <CategoryClient categories={categories} />;
}
