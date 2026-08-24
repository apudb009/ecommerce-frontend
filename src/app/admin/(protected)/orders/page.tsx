'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { useTable } from '@/hooks/useTable';
import AdminSearch from '@/components/admin/table/AdminSearch';
import AdminPagination from '@/components/admin/table/AdminPagination';
import SortableHeader from '@/components/admin/table/SortableHeader';
import { Order, OrderStatus, User } from '@/lib/types';
import { ShoppingBag } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/helpers/checkPermission';
import RestrictedAccess from '@/components/admin/RestrictedAccess';

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
};

const STATUS_OPTIONS = [
  '',
  'PENDING',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

export default function AdminOrdersClient() {
  const {
    data: orders,
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
  } = useTable<Order & { user: User }>({
    endpoint: '/orders/admin/all',
    defaultSort: 'createdAt',
  });

  const { permissions } = useAuthStore();

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <ShoppingBag className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        {meta && (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-600">
            {meta.total}
          </span>
        )}
      </div>
      {hasPermission(permissions, 'orders', 'read') ? (
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

          {/* ── TABLE ───────────────────────────────────── */}
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <SortableHeader
                    label="Order"
                    field="id"
                    currentSort={sort}
                    currentOrder={order}
                    onSortAction={setSort}
                    className="w-24"
                  />
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                    Customer
                  </th>
                  <SortableHeader
                    label="Date"
                    field="createdAt"
                    currentSort={sort}
                    currentOrder={order}
                    onSortAction={setSort}
                  />
                  <SortableHeader
                    label="Total"
                    field="totalAmount"
                    currentSort={sort}
                    currentOrder={order}
                    onSortAction={setSort}
                  />
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  Array.from({ length: limit }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 animate-pulse rounded bg-gray-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                      <ShoppingBag className="mx-auto mb-2 h-8 w-8 text-gray-200" />
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">#{order.id}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.user?.name || order.user?.username}
                          </p>
                          <p className="text-xs text-gray-400">{order.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {format(new Date(order.createdAt), 'MMM d, yyyy')}
                        <p className="text-xs text-gray-400">
                          {format(new Date(order.createdAt), 'h:mm a')}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        ${Number(order.grandTotalAmount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[order.status]}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {hasPermission(permissions, 'orders', 'read') && (
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            View →
                          </Link>
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
