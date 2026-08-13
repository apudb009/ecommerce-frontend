'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Truck } from 'lucide-react';
import { Shipping } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/helpers/checkPermission';
import RestrictedAccess from '@/components/admin/RestrictedAccess';
import DeleteModal from '@/components/ui/DeleteModal';
import ShippingModal from './modal';

export default function AdminShippingPage() {
  const { permissions } = useAuthStore();
  const [methods, setMethods] = useState<Shipping[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Shipping | null>(null);
  const [activeShipping, setActiveShipping] = useState<Shipping>();

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const { data } = await api.get('/shipping');
        setMethods(data);
      } catch {
        toast.error('Failed to load shipping methods');
      } finally {
        setLoading(false);
      }
    };

    void fetchMethods();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/shipping/${id}`);
      setMethods((prev) => prev.filter((s) => s.id !== id));
      toast.success('Shipping method deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setActiveShipping(undefined);
    }
  };

  const handleSetActive = async (method: Shipping) => {
    if (method.isActive) return;
    const hasAccess = hasPermission(permissions, 'shipping', 'update');
    if (!hasAccess) {
      toast.error('You do not have permission to update shipping');
      return;
    }
    try {
      const { data } = await api.patch(`/shipping/${method.id}`, {
        isActive: true,
      });
      setMethods((prev) => prev.map((s) => ({ ...s, isActive: s.id === data.id })));
      toast.success(`${method.name} set as active shipping`);
    } catch {
      toast.error('Failed to update');
    }
  };

  const activeMethod = methods.find((m) => m.isActive);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipping Methods</h1>
          <p className="mt-1 text-sm text-gray-500">
            Only one shipping method can be active at a time
          </p>
        </div>
        {hasPermission(permissions, 'shipping', 'create') && (
          <button
            onClick={() => {
              setEditing(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Shipping Method
          </button>
        )}
      </div>

      {hasPermission(permissions, 'shipping', 'read') ? (
        <>
          {/* active shipping highlight */}
          {activeMethod && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <Truck className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Active Shipping: {activeMethod.name}
                </p>
                <p className="text-xs text-green-600">
                  {Number(activeMethod.price) === 0
                    ? 'Free shipping'
                    : `$${Number(activeMethod.price).toFixed(2)} per order`}
                </p>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : methods.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                      No shipping methods added yet
                    </td>
                  </tr>
                ) : (
                  methods.map((method) => (
                    <tr
                      key={method.id}
                      className={method.isActive ? 'bg-green-50' : 'hover:bg-gray-50'}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {method.isActive && (
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{method.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {Number(method.price) === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `$${Number(method.price).toFixed(2)}`
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {method.isActive ? (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                            Active
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetActive(method)}
                            className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500 hover:bg-blue-100 hover:text-blue-700"
                          >
                            Set Active
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {hasPermission(permissions, 'shipping', 'update') && (
                            <button
                              onClick={() => {
                                setEditing(method);
                                setShowModal(true);
                              }}
                              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                          {hasPermission(permissions, 'shipping', 'delete') && (
                            <button
                              onClick={() => setActiveShipping(method)}
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
        </>
      ) : (
        <RestrictedAccess />
      )}

      {activeShipping && (
        <DeleteModal
          isOpen={!!activeShipping}
          title="Delete Shipping Method"
          text={`Are you sure you want to delete this shipping method "${activeShipping.name}"?`}
          onClose={() => setActiveShipping(undefined)}
          onConfirm={() => handleDelete(activeShipping.id)}
        />
      )}

      {showModal && (
        <ShippingModal
          method={editing}
          onClose={() => setShowModal(false)}
          onSaved={(saved) => {
            if (editing) {
              setMethods((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
            } else {
              if (saved.isActive) {
                setMethods((prev) => [...prev.map((s) => ({ ...s, isActive: false })), saved]);
              } else {
                setMethods((prev) => [...prev, saved]);
              }
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
