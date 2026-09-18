import { Category, User, UserPermission } from '@/lib/types';
import { serverFetch } from '@/lib/server-api';
import CategoryClient from '@/components/admin/category/CategoryClient';

export default async function AdminCategoriesPage() {
  const [user, categories] = await Promise.all([
    serverFetch<User>('/user/me'),
    serverFetch<Category[]>('/categories'),
  ]);

  const permissions: UserPermission[] =
    user.userRole?.permissions?.map((entry) => ({
      module: entry.permission.module,
      action: entry.permission.action,
    })) ?? [];

  return <CategoryClient categories={categories} permissions={permissions} />;
}
