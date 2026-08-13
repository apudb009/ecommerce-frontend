'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/helpers/checkPermission';
import DeleteModal from '@/components/ui/DeleteModal';
import { Tax } from '@/lib/types';
import TaxModal from './modal';
import ActiveTax from './Active';

export default function AdminTaxesPage() {
  const { permissions } = useAuthStore();
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Tax | null>(null);
  const [activeTax, setActiveTax] = useState<Tax>();

  useEffect(() => {
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
    void fetchTaxes();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/taxes/${id}`);
      setTaxes((prev) => prev.filter((t) => t.id !== id));
      toast.success('Tax deleted');
    } catch {
      toast.error('Failed to delete tax');
    } finally {
      setActiveTax(undefined);
    }
  };

  const handleSetActive = async (tax: Tax) => {
    if (tax.isActive) return;
    const hasAccess = hasPermission(permissions, 'taxes', 'update');

    if (!hasAccess) {
      toast.error('You do not have permission to update taxes');
      return;
    }
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
        {hasPermission(permissions, 'taxes', 'create') && (
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
        )}
      </div>

      {/* active tax highlight */}
      {taxes.find((t) => t.isActive) && <ActiveTax taxes={taxes} />}

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
                      {hasPermission(permissions, 'taxes', 'update') && (
                        <button
                          onClick={() => {
                            setEditing(tax);
                            setShowModal(true);
                          }}
                          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      {hasPermission(permissions, 'taxes', 'delete') && (
                        <button
                          onClick={() => setActiveTax(tax)}
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
      </div>

      {activeTax && (
        <DeleteModal
          isOpen={!!activeTax}
          title="Delete Tax"
          text={`Are you sure you want to delete "${activeTax.name}"?`}
          onClose={() => setActiveTax(undefined)}
          onConfirm={() => handleDelete(activeTax.id)}
        />
      )}

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
