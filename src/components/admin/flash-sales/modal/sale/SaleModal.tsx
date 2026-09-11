import api from '@/lib/api';
import { FlashSale } from '@/lib/types';
import { useSettingsStore } from '@/store/settingsStore';
import { Zap } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  FieldErrors,
  required,
  stringLength,
  positiveNumber,
  dateTimeRangeValid,
  HEX_COLOR_PATTERN,
  compact,
} from '@/lib/validators';

type Errors = FieldErrors<'name' | 'discountValue' | 'startTime' | 'endTime' | 'bannerColor'>;

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
  const {
    settings: { currency_symbol: currencySymbol },
  } = useSettingsStore();

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
  const [errors, setErrors] = useState<Errors>({});

  const clearError = (field: keyof Errors) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): Errors => {
    const range = dateTimeRangeValid(form.startTime, form.endTime, {
      start: 'Start time',
      end: 'End time',
    });

    return compact({
      name: required(form.name, 'Sale name') || stringLength(form.name, 'Sale name', { max: 80 }),
      discountValue: positiveNumber(form.discountValue, 'Value', {
        max: form.discountType === 'PERCENTAGE' ? 100 : undefined,
      }),
      startTime: range.start,
      endTime: range.end,
      bannerColor:
        form.bannerColor.trim() && !HEX_COLOR_PATTERN.test(form.bannerColor.trim())
          ? 'Enter a valid hex color (e.g. #ef4444)'
          : undefined,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    const payload = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim() || undefined,
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

  const errorClass = (field: keyof Errors, extra = '') =>
    `w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${extra} ${
      errors[field] ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-orange-500'
    }`;

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

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Sale Name</label>
            <input
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                clearError('name');
              }}
              placeholder="e.g. Weekend Flash Sale"
              className={errorClass('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
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
                onChange={(e) => {
                  setForm({ ...form, discountType: e.target.value });
                  clearError('discountValue');
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed ({currencySymbol})</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Value ({form.discountType === 'PERCENTAGE' ? '%' : `${currencySymbol}`})
              </label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => {
                  setForm({ ...form, discountValue: e.target.value });
                  clearError('discountValue');
                }}
                min="0.01"
                step="0.01"
                placeholder={form.discountType === 'PERCENTAGE' ? '20' : '10'}
                className={errorClass('discountValue')}
              />
              {errors.discountValue && (
                <p className="mt-1 text-xs text-red-500">{errors.discountValue}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => {
                  setForm({ ...form, startTime: e.target.value });
                  clearError('startTime');
                  clearError('endTime');
                }}
                className={errorClass('startTime')}
              />
              {errors.startTime && <p className="mt-1 text-xs text-red-500">{errors.startTime}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => {
                  setForm({ ...form, endTime: e.target.value });
                  clearError('endTime');
                }}
                className={errorClass('endTime')}
              />
              {errors.endTime && <p className="mt-1 text-xs text-red-500">{errors.endTime}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Banner Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={
                  /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(form.bannerColor)
                    ? form.bannerColor
                    : '#ef4444'
                }
                onChange={(e) => {
                  setForm({ ...form, bannerColor: e.target.value });
                  clearError('bannerColor');
                }}
                className="h-9 w-12 cursor-pointer rounded-md border border-gray-300 p-0.5"
              />
              <input
                value={form.bannerColor}
                onChange={(e) => {
                  setForm({ ...form, bannerColor: e.target.value });
                  clearError('bannerColor');
                }}
                className={errorClass('bannerColor', 'flex-1 font-mono')}
              />
              {/* quick color presets */}
              <div className="flex gap-1">
                {['#ef4444', '#f97316', '#8b5cf6', '#2563eb', '#16a34a'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, bannerColor: color });
                      clearError('bannerColor');
                    }}
                    className="h-9 w-9 rounded-md border-2 border-white shadow"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            {errors.bannerColor && (
              <p className="mt-1 text-xs text-red-500">{errors.bannerColor}</p>
            )}
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
