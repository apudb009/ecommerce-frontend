import api from '@/lib/api';
import { FlashSale } from '@/lib/types';
import { Zap } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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

export default FlashSaleModal;
