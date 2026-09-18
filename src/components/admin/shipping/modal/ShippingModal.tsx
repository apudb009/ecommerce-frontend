import api from '@/lib/api';
import { Shipping } from '@/lib/types';
import { useSettingsStore } from '@/store/settingsStore';
import { FC, useState } from 'react';
import { toast } from 'sonner';
import { FieldErrors, required, positiveNumber, compact } from '@/lib/validators';

type Props = {
  method: Shipping | null;
  onClose: () => void;
  onSaved: (method: Shipping) => void;
};

type Errors = FieldErrors<'name' | 'price'>;

// ── SHIPPING MODAL ──────────────────────────────────
const ShippingModal: FC<Props> = ({ method, onClose, onSaved }) => {
  const {
    settings: { currency_symbol: currencySymbol },
  } = useSettingsStore();
  const isEdit = !!method;
  const [form, setForm] = useState({
    name: method?.name || '',
    price: method?.price?.toString() || '0',
    isActive: method?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const clearError = (field: keyof Errors) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): Errors => {
    return compact({
      name: required(form.name, 'Name'),
      price: required(form.price, 'Price') && positiveNumber(form.price, 'Price'),
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
      name: form.name,
      price: Number(form.price),
      isActive: form.isActive,
    };

    try {
      const { data } = isEdit
        ? await api.patch(`/shipping/${method.id}`, payload)
        : await api.post('/shipping', payload);
      toast.success(isEdit ? 'Shipping updated' : 'Shipping method created');
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {isEdit ? 'Edit Shipping Method' : 'New Shipping Method'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                clearError('name');
              }}
              placeholder="e.g. Standard Shipping, Express, Free Shipping"
              className={errorClass('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* price */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Price ({currencySymbol})
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => {
                setForm({ ...form, price: e.target.value });
                clearError('price');
              }}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={errorClass('price')}
            />
            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
            {Number(form.price) === 0 && (
              <p className="mt-1 text-xs text-green-600">✅ This will be shown as Free Shipping</p>
            )}
          </div>

          {/* active */}
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded text-blue-600"
            />
            Set as active shipping method
            <span className="text-xs text-gray-400">(will deactivate others)</span>
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
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingModal;
