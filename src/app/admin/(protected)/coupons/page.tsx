'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Coupon, CouponType } from '@/lib/types';
import { useTable } from '@/hooks/useTable';
import AdminSearch from '@/components/admin/table/AdminSearch';
import AdminPagination from '@/components/admin/table/AdminPagination';
import SortableHeader from '@/components/admin/table/SortableHeader';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/helpers/checkPermission';
import RestrictedAccess from '@/components/admin/RestrictedAccess';
import DeleteModal from '@/components/ui/DeleteModal';
import CouponModal from './modals/Coupon';

export default function AdminCouponsPage() {
  const {
    data: coupons,
    meta,
    loading,
    limit,
    search,
    sort,
    order,
    setPage,
    setSearch,
    setSort,
    setLimit,
    refresh,
  } = useTable<Coupon>({
    endpoint: '/coupons',
    defaultSort: 'createdAt',
  });

  const { permissions } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [activeCoupon, setActiveCoupon] = useState<Coupon>();

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/coupons/${id}`);
      refresh();
      toast.success('Coupon deleted');
    } catch {
      toast.error('Failed to delete coupon');
    } finally {
      setActiveCoupon(undefined);
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    try {
      await api.patch(`/coupons/${coupon.id}`, {
        isActive: !coupon.isActive,
      });
      refresh();
    } catch {
      toast.error('Failed to update coupon');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="mb-6 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          {meta && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-600">
              {meta.total}
            </span>
          )}
        </div>
        {hasPermission(permissions, 'coupons', 'create') && (
          <button
            onClick={() => {
              setEditing(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Coupon
          </button>
        )}
      </div>
      {hasPermission(permissions, 'coupons', 'read') ? (
        <>
          {/* ── TOOLBAR ─────────────────────────────────── */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {/* search */}
            <AdminSearch
              value={search}
              onChangeAction={setSearch}
              placeholder="Search by coupon code..."
            />
          </div>
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <SortableHeader
                    label="Code"
                    field="code"
                    currentSort={sort}
                    currentOrder={order}
                    onSortAction={setSort}
                    className="px-4 py-3"
                  />
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Uses</th>
                  <th className="px-4 py-3">Expires</th>
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
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-gray-100 px-2 py-1 font-mono text-sm font-bold">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{coupon.type}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {coupon.type === 'PERCENTAGE'
                          ? `${coupon.value}%`
                          : `$${Number(coupon.value).toFixed(2)}`}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {coupon.usedCount}
                        {coupon.maxUses ? ` / ${coupon.maxUses}` : ' / ∞'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {coupon.expiresAt
                          ? format(new Date(coupon.expiresAt), 'MMM d, yyyy')
                          : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        {hasPermission(permissions, 'coupons', 'update') && (
                          <button
                            onClick={() => handleToggle(coupon)}
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              coupon.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {coupon.isActive ? 'Active' : 'Inactive'}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {hasPermission(permissions, 'coupons', 'update') && (
                            <button
                              onClick={() => {
                                setEditing(coupon);
                                setShowModal(true);
                              }}
                              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                          {hasPermission(permissions, 'coupons', 'delete') && (
                            <button
                              onClick={() => setActiveCoupon(coupon)}
                              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
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

      {activeCoupon && (
        <DeleteModal
          isOpen={!!activeCoupon}
          title="Delete Coupon"
          text={`Are you sure you want to delete this coupon ${activeCoupon.code}?`}
          onConfirm={() => handleDelete(activeCoupon.id)}
          onClose={() => setActiveCoupon(undefined)}
        />
      )}

      {showModal && (
        <CouponModal
          coupon={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            if (editing) {
              refresh();
            } else {
              refresh();
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
