'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { Invoice } from '@/lib/types';
import { useAdminTable } from '@/hooks/useAdminTable';
import SortableHeader from '@/components/admin/table/SortableHeader';
import AdminPagination from '@/components/admin/table/AdminPagination';
import AdminSearch from '@/components/admin/table/AdminSearch';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/helpers/checkPermission';
import RestrictedAccess from '@/components/admin/RestrictedAccess';

const STATUS_COLORS = {
  PAID: 'bg-green-100 text-green-700',
  UNPAID: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const STATUS_OPTIONS = ['', 'PAID', 'UNPAID', 'CANCELLED'];

export default function AdminInvoicesPage() {
  const {
    data: invoices,
    meta,
    loading,
    limit,
    search,
    sort,
    order,
    setPage,
    setSearch,
    setFilter,
    setSort,
    setLimit,
    refresh,
  } = useAdminTable<Invoice>({
    endpoint: '/invoices/admin/all',
    defaultSort: 'issuedAt',
  });

  const { permissions } = useAuthStore();

  const [downloading, setDownloading] = useState<number | null>(null);

  const handleDownload = async (invoice: Invoice) => {
    setDownloading(invoice.id);
    try {
      const response = await api.get(`/invoices/${invoice.id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoice.invoiceNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Downloaded');
    } catch {
      toast.error('Failed to download');
    } finally {
      setDownloading(null);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const hasActionPermission = hasPermission(permissions, 'invoices', 'update');
      if (!hasActionPermission) {
        toast.error('You do not have permission to update invoice status');
        return;
      }
      await api.patch(`/invoices/${id}/status`, { status });
      refresh();
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        {meta && (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-600">
            {meta.total}
          </span>
        )}
      </div>

      {hasPermission(permissions, 'invoices', 'read') ? (
        <>
          {/* ── TOOLBAR ─────────────────────────────────── */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {/* search */}
            <AdminSearch
              value={search}
              onChangeAction={setSearch}
              placeholder="Search by order ID, customer..."
            />

            {/* status filter tabs */}
            <div className="flex gap-1.5 overflow-x-auto">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter('status', status || null)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    (new URLSearchParams(window?.location?.search || '').get('status') || '') ===
                    status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status || 'All'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <SortableHeader
                    label="Invoice"
                    field="id"
                    currentSort={sort}
                    currentOrder={order}
                    onSortAction={setSort}
                    className="px-4 py-3"
                  />
                  <th className="px-4 py-3">Customer</th>
                  <SortableHeader
                    label="Order"
                    field="orderId"
                    currentSort={sort}
                    currentOrder={order}
                    onSortAction={setSort}
                    className="px-4 py-3"
                  />
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : !invoices.length ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{invoice.invoiceNo}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {invoice.user?.name || invoice.user?.email}
                      </td>
                      <td className="px-4 py-3 text-gray-500">#{invoice.order?.id}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {format(new Date(invoice.issuedAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        ${Number(invoice.order?.grandTotalAmount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={invoice.status}
                          onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                          className={`rounded-full px-2 py-1 text-xs font-medium border-0 ${STATUS_COLORS[invoice.status as keyof typeof STATUS_COLORS]}`}
                        >
                          <option value="UNPAID">UNPAID</option>
                          <option value="PAID">PAID</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDownload(invoice)}
                          disabled={downloading === invoice.id}
                          className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 ml-auto"
                        >
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* ── PAGINATION ───────────────────────────── */}
            {meta && (
              <AdminPagination
                page={meta.page}
                lastPage={meta.lastPage}
                total={meta.total}
                limit={limit}
                hasNextPage={meta.hasNextPage}
                hasPrevPage={meta.hasPrevPage}
                onPageChange={setPage}
                onLimitChange={setLimit}
              />
            )}
          </div>
        </>
      ) : (
        <RestrictedAccess />
      )}
    </div>
  );
}
