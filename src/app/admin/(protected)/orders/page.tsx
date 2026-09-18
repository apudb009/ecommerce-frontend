import { Order, PaginatedResponse, User, UserPermission } from '@/lib/types';
import { serverFetch } from '@/lib/server-api';
import AdminOrdersClient from '@/components/admin/orders/OrderClient';

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = params.page ?? '1';
  const limit = params.limit ?? '10';
  const search = params.search;
  const status = params.status;
  const sortBy = params.sort ?? 'createdAt';
  const sortOrder = params.order ?? 'desc';
  const query = new URLSearchParams(
    Object.entries({ page, limit, search, status, sortBy, sortOrder }).filter(
      ([, value]) => value !== undefined,
    ) as [string, string][],
  ).toString();
  const queryKey = `${page}|${limit}|${search ?? ''}|${status}|${sortBy}|${sortOrder}|{}`;

  const [user, orders] = await Promise.all([
    serverFetch<User>('/user/me', { revalidate: 0 }),
    serverFetch<PaginatedResponse<Order & { user: User }>>(`/orders/admin/all?${query}`, {
      revalidate: 0,
    }),
  ]);

  const permissions: UserPermission[] =
    user.userRole?.permissions?.map((entry) => ({
      module: entry.permission.module,
      action: entry.permission.action,
    })) ?? [];

  return (
    <AdminOrdersClient
      initialData={orders.data}
      initialMeta={orders.meta}
      initialQueryKey={queryKey}
      permissions={permissions}
    />
  );
}
