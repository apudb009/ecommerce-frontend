'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Zap, X } from 'lucide-react';
import { format } from 'date-fns';
import CountdownTimer from '@/components/ui/CountdownTimer';
import { FlashSale, FlashSaleProduct, Product } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/helpers/checkPermission';
import Image from 'next/image';

export default function FlashSalesClient() {
  const { permissions } = useAuthStore();
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<FlashSale | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const { data } = await api.get('/flash-sales');
        setSales(data);
      } catch {
        toast.error('Failed to load flash sales');
      } finally {
        setLoading(false);
      }
    };
    void fetchSales();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this flash sale?')) return;
    try {
      await api.delete(`/flash-sales/${id}`);
      setSales((prev) => prev.filter((s) => s.id !== id));
      toast.success('Flash sale deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const getSaleStatus = (sale: FlashSale) => {
    const now = new Date();
    const start = new Date(sale.startTime);
    const end = new Date(sale.endTime);

    if (!sale.isActive) return { label: 'Inactive', color: 'bg-gray-100 text-gray-500' };
    if (now < start) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-700' };
    if (now > end) return { label: 'Ended', color: 'bg-red-100 text-red-700' };
    return { label: 'Live 🔥', color: 'bg-green-100 text-green-700' };
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">Flash Sales</h1>
        </div>
        {hasPermission(permissions, 'flash-sales', 'create') && (
          <button
            onClick={() => {
              setEditing(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            New Flash Sale
          </button>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
        ) : sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-16 text-center">
            <Zap className="mb-3 h-10 w-10 text-gray-300" />
            <p className="text-gray-500">No flash sales yet</p>
          </div>
        ) : (
          sales.map((sale) => {
            const status = getSaleStatus(sale);
            const isLive = status.label === 'Live 🔥';
            return (
              <div
                key={sale.id}
                className={`overflow-hidden rounded-xl border bg-white shadow-sm ${
                  isLive ? 'border-orange-200' : ''
                }`}
              >
                {/* header */}
                <div
                  className="flex items-center justify-between p-4"
                  style={isLive ? { backgroundColor: `${sale.bannerColor}15` } : {}}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: sale.bannerColor }}
                    >
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{sale.name}</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">
                          {sale.discountType === 'PERCENTAGE'
                            ? `${sale.discountValue}% OFF`
                            : `$${sale.discountValue} OFF`}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {format(new Date(sale.startTime), 'MMM d, h:mm a')} →{' '}
                        {format(new Date(sale.endTime), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isLive && (
                      <div className="text-orange-600">
                        <CountdownTimer endTime={sale.endTime} size="sm" />
                      </div>
                    )}
                    {hasPermission(permissions, 'flash-sales', 'update') && (
                      <button
                        onClick={() => {
                          setEditing(sale);
                          setShowModal(true);
                        }}
                        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                    {hasPermission(permissions, 'flash-sales', 'delete') && (
                      <button
                        onClick={() => handleDelete(sale.id)}
                        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* products */}
                {sale.products.length > 0 && (
                  <div className="border-t px-4 py-3">
                    <p className="mb-2 text-xs font-medium text-gray-500">
                      {sale.products.length} product{sale.products.length > 1 ? 's' : ''} in sale
                    </p>
                    <div className="flex gap-2 overflow-x-auto">
                      {sale.products.map((sp: FlashSaleProduct) => (
                        <div
                          key={sp.product.id}
                          className="flex shrink-0 items-center gap-2 rounded-md border bg-gray-50 px-2 py-1.5"
                        >
                          {sp.product.images?.[0] && (
                            <Image
                              src={sp.product.images[0]?.url}
                              alt=""
                              className="h-8 w-8 rounded object-contain"
                              width={32}
                              height={32}
                            />
                          )}
                          <div>
                            <p className="text-xs font-medium text-gray-800">{sp.product.name}</p>
                            <p className="text-xs text-gray-400">
                              ${Number(sp.product.price).toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                await api.delete(
                                  `/flash-sales/${sale.id}/products/${sp.product.id}`,
                                );
                                setSales((prev) =>
                                  prev.map((s) =>
                                    s.id === sale.id
                                      ? {
                                          ...s,
                                          products: s.products.filter(
                                            (p: FlashSaleProduct) => p.product.id !== sp.product.id,
                                          ),
                                        }
                                      : s,
                                  ),
                                );
                                toast.success('Product removed from sale');
                              } catch {
                                toast.error('Failed to remove product');
                              }
                            }}
                            className="ml-1 text-gray-300 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* add products */}
                <AddProductsToSale
                  saleId={sale.id}
                  existingProductIds={sale.products.map((p: FlashSaleProduct) => p.product.id)}
                  onAdded={(updated) =>
                    setSales((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
                  }
                />
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <FlashSaleModal
          sale={editing}
          onClose={() => setShowModal(false)}
          onSaved={(saved) => {
            if (editing) {
              setSales((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
            } else {
              setSales((prev) => [saved, ...prev]);
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

// ── ADD PRODUCTS TO SALE ────────────────────────────
function AddProductsToSale({
  saleId,
  existingProductIds,
  onAdded,
}: {
  saleId: number;
  existingProductIds: number[];
  onAdded: (sale: FlashSale) => void;
}) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (q: string) => {
    setSearch(q);
    if (q.length < 2) {
      setResults([]);
      return;
    }
    try {
      const { data } = await api.get('/products', { params: { search: q, limit: 5 } });
      setResults(data.data.filter((p: Product) => !existingProductIds.includes(p.id)));
    } catch {
      // silent
    }
  };

  const handleAdd = async (productId: number) => {
    setLoading(true);
    try {
      const { data } = await api.post(`/flash-sales/${saleId}/products`, {
        productIds: [productId],
      });
      onAdded(data);
      setSearch('');
      setResults([]);
      toast.success('Product added to sale');
    } catch {
      toast.error('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t px-4 py-3">
      {!show ? (
        <button
          onClick={() => setShow(true)}
          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Products to Sale
        </button>
      ) : (
        <div className="relative">
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products to add..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          {results.length > 0 && (
            <div className="left-0 right-0 top-full z-10 mt-1 rounded-md border bg-white shadow-lg">
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleAdd(p.id)}
                  disabled={loading}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  {p.images?.[0] && (
                    <img src={p.images[0].url} alt="" className="h-8 w-8 rounded object-cover" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400">${Number(p.price).toFixed(2)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => {
              setShow(false);
              setSearch('');
              setResults([]);
            }}
            className="mt-1 text-xs text-gray-400 hover:text-gray-600"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ── FLASH SALE MODAL ───────────────────────────────
function FlashSaleModal({
  sale,
  onClose,
  onSaved,
}: {
  sale: FlashSale | null;
  onClose: () => void;
  onSaved: (sale: FlashSale) => void;
}) {
  const isEdit = !!sale;

  const toDatetimeLocal = (date?: string) => {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 16);
  };

  const [form, setForm] = useState({
    name: sale?.name || '',
    description: sale?.description || '',
    discountType: sale?.discountType || 'PERCENTAGE',
    discountValue: sale?.discountValue || '',
    startTime: toDatetimeLocal(sale?.startTime),
    endTime: toDatetimeLocal(sale?.endTime),
    isActive: sale?.isActive ?? true,
    bannerColor: sale?.bannerColor || '#ef4444',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
    };

    try {
      const { data } = isEdit
        ? await api.patch(`/flash-sales/${sale.id}`, payload)
        : await api.post('/flash-sales', payload);
      toast.success(isEdit ? 'Flash sale updated' : 'Flash sale created');
      onSaved(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Zap className="h-5 w-5 text-orange-500" />
          {isEdit ? 'Edit Flash Sale' : 'New Flash Sale'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Sale Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Weekend Flash Sale"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short description (optional)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Discount Type</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed ($)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Value ({form.discountType === 'PERCENTAGE' ? '%' : '$'})
              </label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                min="0.01"
                step="0.01"
                placeholder={form.discountType === 'PERCENTAGE' ? '20' : '10'}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Banner Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={form.bannerColor}
                onChange={(e) => setForm({ ...form, bannerColor: e.target.value })}
                className="h-9 w-12 cursor-pointer rounded-md border border-gray-300 p-0.5"
              />
              <input
                value={form.bannerColor}
                onChange={(e) => setForm({ ...form, bannerColor: e.target.value })}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {/* quick color presets */}
              <div className="flex gap-1">
                {['#ef4444', '#f97316', '#8b5cf6', '#2563eb', '#16a34a'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, bannerColor: color })}
                    className="h-9 w-9 rounded-md border-2 border-white shadow"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* preview */}
          {form.name && (
            <div
              className="rounded-lg p-3 text-white"
              style={{ backgroundColor: form.bannerColor }}
            >
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4" />
                <strong>{form.name}</strong>
                <span className="opacity-80">
                  {form.discountType === 'PERCENTAGE'
                    ? `— ${form.discountValue}% OFF`
                    : `— $${form.discountValue} OFF`}
                </span>
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded"
            />
            Active
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
