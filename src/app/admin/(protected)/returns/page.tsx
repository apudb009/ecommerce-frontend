'use client';

import api from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { RotateCcw } from 'lucide-react';
import { ReturnRequest } from '@/lib/types';
import { useAdminTable } from '@/hooks/useAdminTable';
import SortableHeader from '@/components/admin/table/SortableHeader';
import AdminPagination from '@/components/admin/table/AdminPagination';
import AdminSearch from '@/components/admin/table/AdminSearch';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/helpers/checkPermission';
import RestrictedAccess from '@/components/admin/RestrictedAccess';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-green-100 text-green-700',
};

const STATUS_OPTIONS = ['', 'PENDING', 'APPROVED', 'REJECTED', 'REFUNDED'];

export default function AdminReturnsPage() {
  const {
    data: returns,
    meta,
    loading,
    limit,
    search,
    sort,
    order,
    setPage,
    setFilter,
    setSearch,
    setSort,
    setLimit,
    refresh,
  } = useAdminTable<ReturnRequest>({
    endpoint: '/returns/admin/all',
    defaultSort: 'createdAt',
  });

  const { permissions } = useAuthStore();

  const handleUpdateStatus = async (id: number, status: string, adminNote?: string) => {
    try {
      const hasActionPermission = hasPermission(permissions, 'returns', 'update');
      if (!hasActionPermission) {
        toast.error('You do not have permission to update return status');
        return;
      }
      await api.patch(`/returns/${id}/status`, { status, adminNote });
      refresh();
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <RotateCcw className="h-6 w-6 text-orange-500" />
        <h1 className="text-2xl font-bold text-gray-900">Return Requests</h1>
        {meta && (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-600">
            {meta.total}
          </span>
        )}
      </div>
      {hasPermission(permissions, 'returns', 'read') ? (
        <>
          {/* ── TOOLBAR ─────────────────────────────────── */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {/* search */}
            <AdminSearch
              value={search}
              onChangeAction={setSearch}
              placeholder="Search by user email, name..."
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
                    label="ID"
                    field="id"
                    currentSort={sort}
                    currentOrder={order}
                    onSortAction={setSort}
                    className="px-4 py-3"
                  />
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Date</th>
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
                ) : returns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      No return requests yet
                    </td>
                  </tr>
                ) : (
                  returns.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">#{r.id}</td>
                      <td className="px-4 py-3 text-gray-600">{r.user?.name || r.user?.email}</td>
                      <td className="px-4 py-3 text-gray-500">#{r.order?.id}</td>
                      <td className="px-4 py-3 text-gray-600">{r.reason.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-gray-400">
                        {format(new Date(r.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[r.status]}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {r.status === 'PENDING' &&
                          hasPermission(permissions, 'returns', 'update') && (
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleUpdateStatus(r.id, 'APPROVED')}
                                className="rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(r.id, 'REJECTED')}
                                className="rounded-md bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        {r.status === 'APPROVED' &&
                          hasPermission(permissions, 'returns', 'update') && (
                            <button
                              onClick={() => handleUpdateStatus(r.id, 'REFUNDED')}
                              className="rounded-md bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                            >
                              Mark Refunded
                            </button>
                          )}
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
