'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Coupon, CouponType } from '@/lib/types';
import { useAdminTable } from '@/hooks/useAdminTable';
import AdminSearch from '@/components/admin/table/AdminSearch';
import AdminPagination from '@/components/admin/table/AdminPagination';
import SortableHeader from '@/components/admin/table/SortableHeader';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/helpers/checkPermission';

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
  } = useAdminTable<Coupon>({
    endpoint: '/coupons',
    defaultSort: 'createdAt',
  });

  const { permissions } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await api.delete(`/coupons/${id}`);
      refresh();
      toast.success('Coupon deleted');
    } catch {
      toast.error('Failed to delete coupon');
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
                    {coupon.expiresAt ? format(new Date(coupon.expiresAt), 'MMM d, yyyy') : 'Never'}
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
                          onClick={() => handleDelete(coupon.id, coupon.code)}
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

function CouponModal({
  coupon,
  onClose,
  onSaved,
}: {
  coupon: Coupon | null;
  onClose: () => void;
  onSaved: (c: Coupon) => void;
}) {
  const isEdit = !!coupon;
  const [form, setForm] = useState({
    code: coupon?.code || '',
    type: coupon?.type || 'PERCENTAGE',
    value: coupon?.value || '',
    minOrderAmount: coupon?.minOrderAmount || '',
    maxUses: coupon?.maxUses || '',
    perUserLimit: coupon?.perUserLimit || 1,
    expiresAt: coupon?.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
    isActive: coupon?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      code: form.code,
      type: form.type,
      value: Number(form.value),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
      maxUses: form.maxUses ? Number(form.maxUses) : undefined,
      perUserLimit: Number(form.perUserLimit),
      expiresAt: form.expiresAt || undefined,
      isActive: form.isActive,
    };

    try {
      const { data } = isEdit
        ? await api.patch(`/coupons/${coupon.id}`, payload)
        : await api.post('/coupons', payload);
      toast.success(isEdit ? 'Coupon updated' : 'Coupon created');
      onSaved(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">{isEdit ? 'Edit Coupon' : 'New Coupon'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Code</label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SAVE20"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as CouponType })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed ($)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Value ({form.type === 'PERCENTAGE' ? '%' : '$'})
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Min Order ($)</label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Max Uses</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Unlimited"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Per User Limit</label>
              <input
                type="number"
                value={form.perUserLimit}
                onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Expires At</label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded text-blue-600"
            />
            Active
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
