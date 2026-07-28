'use client';

import { useState } from 'react';
import { Address } from '@/lib/types';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Plus, MapPin, X } from 'lucide-react';

export default function AddressSelector({
  addresses,
  selectedId,
  onSelect,
  onAddressCreated,
}: {
  addresses: Address[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAddressCreated: (address: Address) => void;
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="rounded-lg border bg-white p-5">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
        <MapPin className="h-5 w-5" />
        Delivery Address
      </h2>

      {addresses.length === 0 && !showForm && (
        <p className="mb-3 text-sm text-gray-500">You don&apos;t have any saved addresses yet.</p>
      )}

      <div className="space-y-2">
        {addresses.map((addr) => (
          <label
            key={addr.id}
            className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${
              selectedId === addr.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="address"
              checked={selectedId === addr.id}
              onChange={() => onSelect(addr.id)}
              className="mt-1 text-blue-600"
            />
            <div className="text-sm">
              <p className="font-medium text-gray-900">
                {addr.street}
                {addr.isDefault && (
                  <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    Default
                  </span>
                )}
              </p>
              <p className="text-gray-500">
                {addr.city}, {addr.state} {addr.postalCode}
              </p>
              <p className="text-gray-500">{addr.country}</p>
            </div>
          </label>
        ))}
      </div>

      {showForm ? (
        <NewAddressForm
          onCancel={() => setShowForm(false)}
          onCreated={(addr) => {
            onAddressCreated(addr);
            setShowForm(false);
          }}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-3 flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          <Plus className="h-4 w-4" />
          Add New Address
        </button>
      )}
    </div>
  );
}

// ── INLINE NEW ADDRESS FORM ─────────────────────────
function NewAddressForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (address: Address) => void;
}) {
  const [form, setForm] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/user/addresses', form);
      toast.success('Address added');
      onCreated(data);
    } catch {
      toast.error('Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-md border bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">New Address</h3>
        <button type="button" onClick={onCancel}>
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <input
        placeholder="Street address"
        value={form.street}
        onChange={(e) => setForm({ ...form, street: e.target.value })}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          placeholder="City"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          placeholder="State"
          value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          placeholder="Postal Code"
          value={form.postalCode}
          onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          placeholder="Country"
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Address'}
      </button>
    </form>
  );
}
