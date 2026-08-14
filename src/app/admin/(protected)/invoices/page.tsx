import InvoiceClientAdmin from '@/components/admin/invoice/InvoiceClientAdmin';
import { Suspense } from 'react';

export default function InvoicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <InvoiceClientAdmin />
    </Suspense>
  );
}
