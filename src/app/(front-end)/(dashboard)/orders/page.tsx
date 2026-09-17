import { Order, PaginatedResponse } from '@/lib/types';
import { serverFetch } from '@/lib/server-api';
import OrderClient from '@/components/order/OrderClient';

type OrderPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function OrdersPage({ searchParams }: OrderPageProps) {
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
  const queryKey = `${page}|${limit}|${search ?? ''}|${status || ''}|${sortBy}|${sortOrder}|{}`;
  const invoices = await serverFetch<PaginatedResponse<Order>>(`/orders/me?${query}`, {
    revalidate: 0,
  });

  return (
    <OrderClient
      key={queryKey}
      initialData={invoices.data}
      initialMeta={invoices.meta}
      initialQueryKey={queryKey}
    />
  );
}
