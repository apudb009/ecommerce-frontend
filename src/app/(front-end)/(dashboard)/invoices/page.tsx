import InvoiceClient from '@/components/invoices/InvoiceClient';
import { Suspense } from 'react';
import { serverFetch } from '@/lib/server-api';
import { Invoice, PaginatedResponse } from '@/lib/types';

type InvoicesPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const params = await searchParams;
  const page = params.page ?? '1';
  const limit = params.limit ?? '10';
  const search = params.search;
  const sortBy = params.sort ?? 'issuedAt';
  const sortOrder = params.order ?? 'desc';
  const query = new URLSearchParams(
    Object.entries({ page, limit, search, sortBy, sortOrder }).filter(
      ([, value]) => value !== undefined,
    ) as [string, string][],
  ).toString();
  const queryKey = `${page}|${limit}|${search ?? ''}|${sortBy}|${sortOrder}|{}`;
  const invoices = await serverFetch<PaginatedResponse<Invoice>>(`/invoices?${query}`, {
    revalidate: 0,
  });

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <InvoiceClient
        key={queryKey}
        initialData={invoices.data}
        initialMeta={invoices.meta}
        initialQueryKey={queryKey}
      />
    </Suspense>
  );
}
