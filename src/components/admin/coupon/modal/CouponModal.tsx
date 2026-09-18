import api from '@/lib/api';
import { Coupon, CouponType } from '@/lib/types';
import { useSettingsStore } from '@/store/settingsStore';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
  coupon: Coupon | null;
  onClose: () => void;
  onSaved: (c: Coupon) => void;
};

type FormErrors = Partial<
  Record<'code' | 'value' | 'minOrderAmount' | 'maxUses' | 'perUserLimit' | 'expiresAt', string>
>;

const CODE_PATTERN = /^[A-Z0-9-]+$/;

function CouponModal({ coupon, onClose, onSaved }: Props) {
  const {
    settings: { currency_symbol: currencySymbol },
  } = useSettingsStore();
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
  const [errors, setErrors] = useState<FormErrors>({});

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};

    const code = String(form.code).trim();
    if (!code) {
      next.code = 'Code is required';
    } else if (!CODE_PATTERN.test(code)) {
      next.code = 'Code can only contain letters, numbers, and hyphens';
    } else if (code.length > 30) {
      next.code = 'Code must be under 30 characters';
    }

    const value = Number(form.value);
    if (form.value === '' || Number.isNaN(value)) {
      next.value = 'Value is required';
    } else if (value <= 0) {
      next.value = 'Value must be greater than 0';
    } else if (form.type === 'PERCENTAGE' && value > 100) {
      next.value = 'Percentage cannot exceed 100';
    }

    if (form.minOrderAmount !== '') {
      const minOrder = Number(form.minOrderAmount);
      if (Number.isNaN(minOrder) || minOrder < 0) {
        next.minOrderAmount = 'Enter a valid, non-negative amount';
      }
    }

    if (form.maxUses !== '') {
      const maxUses = Number(form.maxUses);
      if (!Number.isInteger(maxUses) || maxUses < 1) {
        next.maxUses = 'Enter a whole number of at least 1';
      }
    }

    const perUserLimit = Number(form.perUserLimit);
    if (form.perUserLimit === ('' as unknown) || Number.isNaN(perUserLimit)) {
      next.perUserLimit = 'Per user limit is required';
    } else if (!Number.isInteger(perUserLimit) || perUserLimit < 1) {
      next.perUserLimit = 'Enter a whole number of at least 1';
    }

    if (form.expiresAt) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiry = new Date(form.expiresAt);
      if (Number.isNaN(expiry.getTime())) {
        next.expiresAt = 'Enter a valid date';
      } else if (expiry < today) {
        next.expiresAt = 'Expiry date cannot be in the past';
      }
    }

    return next;
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
      code: String(form.code).trim(),
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

  const errorClass = (field: keyof FormErrors, extra = '') =>
    `w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${extra} ${
      errors[field] ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
    }`;

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
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Code</label>
              <input
                value={form.code}
                onChange={(e) => {
                  setForm({ ...form, code: e.target.value.toUpperCase() });
                  clearError('code');
                }}
                className={errorClass('code', 'font-mono')}
                placeholder="SAVE20"
              />
              {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Type</label>
              <select
                value={form.type}
                onChange={(e) => {
                  setForm({ ...form, type: e.target.value as CouponType });
                  clearError('value');
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed ({currencySymbol})</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Value ({form.type === 'PERCENTAGE' ? '%' : `${currencySymbol}`})
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => {
                  setForm({ ...form, value: e.target.value });
                  clearError('value');
                }}
                className={errorClass('value')}
                min="0.01"
                step="0.01"
              />
              {errors.value && <p className="mt-1 text-xs text-red-500">{errors.value}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Min Order ({currencySymbol})
              </label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => {
                  setForm({ ...form, minOrderAmount: e.target.value });
                  clearError('minOrderAmount');
                }}
                className={errorClass('minOrderAmount')}
                placeholder="Optional"
              />
              {errors.minOrderAmount && (
                <p className="mt-1 text-xs text-red-500">{errors.minOrderAmount}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Max Uses</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => {
                  setForm({ ...form, maxUses: e.target.value });
                  clearError('maxUses');
                }}
                className={errorClass('maxUses')}
                placeholder="Unlimited"
              />
              {errors.maxUses && <p className="mt-1 text-xs text-red-500">{errors.maxUses}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Per User Limit</label>
              <input
                type="number"
                value={form.perUserLimit}
                onChange={(e) => {
                  setForm({ ...form, perUserLimit: e.target.value });
                  clearError('perUserLimit');
                }}
                className={errorClass('perUserLimit')}
                min="1"
              />
              {errors.perUserLimit && (
                <p className="mt-1 text-xs text-red-500">{errors.perUserLimit}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Expires At</label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => {
                setForm({ ...form, expiresAt: e.target.value });
                clearError('expiresAt');
              }}
              className={errorClass('expiresAt')}
            />
            {errors.expiresAt && <p className="mt-1 text-xs text-red-500">{errors.expiresAt}</p>}
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

export default CouponModal;
