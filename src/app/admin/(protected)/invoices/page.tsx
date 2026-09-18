import InvoiceClientAdmin from '@/components/admin/invoice/InvoiceAdminClient';
import { serverFetch } from '@/lib/server-api';
import { Invoice, PaginatedResponse, User, UserPermission } from '@/lib/types';

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function InvoicesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = params.page ?? '1';
  const limit = params.limit ?? '10';
  const search = params.search;
  const status = params.status;
  const sortBy = params.sort ?? 'issuedAt';
  const sortOrder = params.order ?? 'desc';
  const query = new URLSearchParams(
    Object.entries({ page, limit, search, status, sortBy, sortOrder }).filter(
      ([, value]) => value !== undefined,
    ) as [string, string][],
  ).toString();
  const queryKey = `${page}|${limit}|${search ?? ''}|${status}|${sortBy}|${sortOrder}|{}`;

  const [user, invoices] = await Promise.all([
    serverFetch<User>('/user/me', { revalidate: 0 }),
    serverFetch<PaginatedResponse<Invoice>>(`/invoices/admin/all?${query}`, {
      revalidate: 0,
    }),
  ]);

  const permissions: UserPermission[] =
    user.userRole?.permissions?.map((entry) => ({
      module: entry.permission.module,
      action: entry.permission.action,
    })) ?? [];

  return (
    <InvoiceClientAdmin
      initialData={invoices.data}
      initialMeta={invoices.meta}
      initialQueryKey={queryKey}
      permissions={permissions}
    />
  );
}
