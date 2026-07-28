'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Check } from 'lucide-react';

interface Tax {
  id: number;
  name: string;
  rate: number;
  type: 'PERCENTAGE' | 'FIXED';
  isActive: boolean;
  createdAt: string;
}

type TaxType = Tax['type'];

export default function AdminTaxesPage() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Tax | null>(null);

  const fetchTaxes = async () => {
    try {
      const { data } = await api.get('/taxes');
      setTaxes(data);
    } catch {
      toast.error('Failed to load taxes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTaxes();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this tax rate?')) return;
    try {
      await api.delete(`/taxes/${id}`);
      setTaxes((prev) => prev.filter((t) => t.id !== id));
      toast.success('Tax deleted');
    } catch {
      toast.error('Failed to delete tax');
    }
  };

  const handleSetActive = async (tax: Tax) => {
    if (tax.isActive) return;
    try {
      const { data } = await api.patch(`/taxes/${tax.id}`, { isActive: true });
      // deactivate all then activate selected
      setTaxes((prev) => prev.map((t) => ({ ...t, isActive: t.id === data.id })));
      toast.success(`${tax.name} set as active tax`);
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tax Rates</h1>
          <p className="mt-1 text-sm text-gray-500">Only one tax rate can be active at a time</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Tax Rate
        </button>
      </div>

      {/* active tax highlight */}
      {taxes.find((t) => t.isActive) && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <Check className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">
              Active Tax: {taxes.find((t) => t.isActive)?.name}
            </p>
            <p className="text-xs text-green-600">
              {taxes.find((t) => t.isActive)?.type === 'PERCENTAGE'
                ? `${taxes.find((t) => t.isActive)?.rate}%`
                : `$${taxes.find((t) => t.isActive)?.rate}`}{' '}
              applied to all orders
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : taxes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No tax rates added yet
                </td>
              </tr>
            ) : (
              taxes.map((tax) => (
                <tr key={tax.id} className={tax.isActive ? 'bg-green-50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      {tax.isActive && <span className="h-2 w-2 rounded-full bg-green-500" />}
                      {tax.name}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                      {tax.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {tax.type === 'PERCENTAGE' ? `${tax.rate}%` : `$${Number(tax.rate).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3">
                    {tax.isActive ? (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        Active
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetActive(tax)}
                        className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500 hover:bg-blue-100 hover:text-blue-700"
                      >
                        Set Active
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditing(tax);
                          setShowModal(true);
                        }}
                        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tax.id)}
                        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <TaxModal
          tax={editing}
          onClose={() => setShowModal(false)}
          onSaved={(saved) => {
            if (editing) {
              setTaxes((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
            } else {
              // if new tax is active, deactivate others
              if (saved.isActive) {
                setTaxes((prev) => [...prev.map((t) => ({ ...t, isActive: false })), saved]);
              } else {
                setTaxes((prev) => [...prev, saved]);
              }
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

// ── TAX MODAL ───────────────────────────────────────
function TaxModal({
  tax,
  onClose,
  onSaved,
}: {
  tax: Tax | null;
  onClose: () => void;
  onSaved: (tax: Tax) => void;
}) {
  const isEdit = !!tax;
  const [form, setForm] = useState({
    name: tax?.name || '',
    rate: tax?.rate?.toString() || '',
    type: (tax?.type || 'PERCENTAGE') as TaxType,
    isActive: tax?.isActive ?? false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save tax');
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {isEdit ? 'Edit Tax Rate' : 'New Tax Rate'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. VAT, Sales Tax"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
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
                <option value="FIXED">Fixed ($)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Rate ({form.type === 'PERCENTAGE' ? '%' : '$'})
              </label>
              <input
                type="number"
                value={form.rate}
                onChange={(e) => setForm({ ...form, rate: e.target.value })}
                placeholder={form.type === 'PERCENTAGE' ? '8' : '5.00'}
                min="0"
                step="0.01"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* rate preview */}
          {form.rate && (
            <div className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
              Preview: On a $100 order, tax would be{' '}
              <strong>
                {form.type === 'PERCENTAGE'
                  ? `$${((100 * Number(form.rate)) / 100).toFixed(2)}`
                  : `$${Number(form.rate).toFixed(2)}`}
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
}
