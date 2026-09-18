import { PaginatedResponse, ReturnRequest, User, UserPermission } from '@/lib/types';
import { serverFetch } from '@/lib/server-api';
import ReturnClient from '@/components/admin/returns/ReturnClient';

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function AdminReturnsPage({ searchParams }: PageProps) {
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

  const [user, returns] = await Promise.all([
    serverFetch<User>('/user/me', { revalidate: 0 }),
    serverFetch<PaginatedResponse<ReturnRequest>>(`/returns/admin/all?${query}`, {
      revalidate: 0,
    }),
  ]);

  const permissions: UserPermission[] =
    user.userRole?.permissions?.map((entry) => ({
      module: entry.permission.module,
      action: entry.permission.action,
    })) ?? [];

  return (
    <ReturnClient
      initialData={returns.data}
      initialMeta={returns.meta}
      initialQueryKey={queryKey}
      permissions={permissions}
    />
  );
}
