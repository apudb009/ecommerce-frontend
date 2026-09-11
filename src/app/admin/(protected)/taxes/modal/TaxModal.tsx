import api from '@/lib/api';
import { Tax, TaxType } from '@/lib/types';
import { useSettingsStore } from '@/store/settingsStore';
import { FC, useState } from 'react';
import { toast } from 'sonner';
import {
  FieldErrors,
  required,
  //stringLength,
  positiveNumber,
  //dateTimeRangeValid,
  //HEX_COLOR_PATTERN,
  compact,
} from '@/lib/validators';

type Props = {
  tax: Tax | null;
  onClose: () => void;
  onSaved: (tax: Tax) => void;
};

type Errors = FieldErrors<'name' | 'rate'>;

// ── TAX MODAL ───────────────────────────────────────
const TaxModal: FC<Props> = ({ tax, onClose, onSaved }) => {
  const isEdit = !!tax;
  const [form, setForm] = useState({
    name: tax?.name || '',
    rate: tax?.rate?.toString() || '',
    type: (tax?.type || 'PERCENTAGE') as TaxType,
    isActive: tax?.isActive ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const {
    settings: { currency_symbol: currencySymbol },
  } = useSettingsStore();

  const clearError = (field: keyof Errors) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): Errors => {
    return compact({
      name: required(form.name, 'Name'),
      rate: required(form.rate, 'Rate') && positiveNumber(form.rate, 'Rate'),
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
      rate: Number(form.rate),
      type: form.type,
      isActive: form.isActive,
    };

    try {
      const { data } = isEdit
        ? await api.patch(`/taxes/${tax.id}`, payload)
        : await api.post('/taxes', payload);
      toast.success(isEdit ? 'Tax updated' : 'Tax created');
      onSaved(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save tax');
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
          {isEdit ? 'Edit Tax Rate' : 'New Tax Rate'}
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
              type="text"
              placeholder="e.g. VAT, Sales Tax"
              className={errorClass('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* type + rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as TaxType })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed ({currencySymbol})</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Rate ({form.type === 'PERCENTAGE' ? '%' : `${currencySymbol}`})
              </label>
              <input
                type="number"
                value={form.rate}
                onChange={(e) => {
                  setForm({ ...form, rate: e.target.value });
                  clearError('rate');
                }}
                placeholder={form.type === 'PERCENTAGE' ? '8' : '5.00'}
                min="0"
                step="0.01"
                className={errorClass('rate')}
              />
              {errors.rate && <p className="mt-1 text-xs text-red-600">{errors.rate}</p>}
            </div>
          </div>

          {/* rate preview */}
          {form.rate && (
            <div className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
              Preview: On a $100 order, tax would be{' '}
              <strong>
                {form.type === 'PERCENTAGE'
                  ? `${currencySymbol}${((100 * Number(form.rate)) / 100).toFixed(2)}`
                  : `${currencySymbol}${Number(form.rate).toFixed(2)}`}
              </strong>
            </div>
          )}

          {/* active */}
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded text-blue-600"
            />
            Set as active tax
            <span className="text-xs text-gray-400">(will deactivate other active taxes)</span>
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

export default TaxModal;
