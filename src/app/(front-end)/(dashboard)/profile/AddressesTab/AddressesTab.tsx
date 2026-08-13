import api from '@/lib/api';
import { Address } from '@/lib/types';
import { Check, Edit2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AddressForm from './Form';

const AddressesTab = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const { data } = await api.get('/user/addresses');
        setAddresses(data);
      } catch {
        toast.error('Failed to load addresses');
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this address?')) return;
    try {
      await api.delete(`/user/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Address deleted');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await api.patch(`/user/addresses/${id}/default`);
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
      toast.success('Default address updated');
    } catch {
      toast.error('Failed to set default');
    }
  };

  if (loading) {
    return <div className="h-32 animate-pulse rounded-lg bg-gray-100" />;
  }

  return (
    <div className="space-y-3">
      {addresses.map((addr) => (
        <div
          key={addr.id}
          className={`rounded-lg border bg-white p-4 ${addr.isDefault ? 'border-blue-300' : ''}`}
        >
          {editingId === addr.id ? (
            <AddressForm
              address={addr}
              onCancel={() => setEditingId(null)}
              onSaved={(updated) => {
                setAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
                setEditingId(null);
              }}
            />
          ) : (
            <div className="flex items-start justify-between">
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{addr.street}</p>
                  {addr.isDefault && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-gray-500">
                  {addr.city}, {addr.state} {addr.postalCode}
                </p>
                <p className="text-gray-500">{addr.country}</p>
              </div>

              <div className="flex items-center gap-1">
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    title="Set as default"
                    className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setEditingId(addr.id)}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* add new */}
      {showForm ? (
        <div className="rounded-lg border bg-white p-4">
          {/* ── ADDRESS FORM (shared for add + edit) ──────────── */}
          <AddressForm
            onCancel={() => setShowForm(false)}
            onSaved={(addr) => {
              setAddresses((prev) => [...prev, addr]);
              setShowForm(false);
            }}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-4 text-sm font-medium text-gray-500 hover:border-blue-300 hover:text-blue-600"
        >
          <Plus className="h-4 w-4" />
          Add New Address
        </button>
      )}
    </div>
  );
};

export default AddressesTab;
