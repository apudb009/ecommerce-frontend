/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Address } from '@/lib/types';
import { toast } from 'sonner';
import { User, MapPin, Lock, Plus, Edit2, Trash2, Check, X } from 'lucide-react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'info' | 'addresses' | 'password'>('info');

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Profile</h1>

      {/* ── TABS ────────────────────────────────────────── */}
      <div className="mb-6 flex border-b">
        {[
          { key: 'info', label: 'Personal Info', icon: User },
          { key: 'addresses', label: 'Addresses', icon: MapPin },
          { key: 'password', label: 'Password', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT ─────────────────────────────────── */}
      {activeTab === 'info' && <PersonalInfoTab />}
      {activeTab === 'addresses' && <AddressesTab />}
      {activeTab === 'password' && <PasswordTab />}
    </div>
  );
}

// ── PERSONAL INFO TAB ───────────────────────────────
function PersonalInfoTab() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.patch('/user/me', {
        name: form.name || undefined,
        username: form.username || undefined,
      });
      setUser(data);
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white p-6">
      {/* avatar placeholder */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
          {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{user?.name || user?.username}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {user?.role}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            value={form.email}
            disabled
            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400"
          />
          <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

// ── ADDRESSES TAB ───────────────────────────────────
function AddressesTab() {
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
}

// ── ADDRESS FORM (shared for add + edit) ────────────
function AddressForm({
  address,
  onCancel,
  onSaved,
}: {
  address?: Address;
  onCancel: () => void;
  onSaved: (address: Address) => void;
}) {
  const isEdit = !!address;
  const [form, setForm] = useState({
    street: address?.street || '',
    city: address?.city || '',
    state: address?.state || '',
    country: address?.country || '',
    postalCode: address?.postalCode || '',
    isDefault: address?.isDefault || false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = isEdit
        ? await api.patch(`/user/addresses/${address.id}`, form)
        : await api.post('/user/addresses', form);

      toast.success(isEdit ? 'Address updated' : 'Address added');
      onSaved(data);
    } catch {
      toast.error('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
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

      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
          className="rounded text-blue-600"
        />
        Set as default address
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEdit ? 'Update' : 'Add Address'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── PASSWORD TAB ────────────────────────────────────
function PasswordTab() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (form.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await api.patch('/user/me/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password updated successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white p-6">
      <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
        {/* current password */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Current Password</label>
          <div className="relative">
            <input
              type={show.current ? 'text' : 'password'}
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShow({ ...show, current: !show.current })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              {show.current ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* new password */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">New Password</label>
          <div className="relative">
            <input
              type={show.new ? 'text' : 'password'}
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShow({ ...show, new: !show.new })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              {show.new ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* confirm password */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={show.confirm ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className={`w-full rounded-md border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                form.confirmPassword && form.newPassword !== form.confirmPassword
                  ? 'border-red-300'
                  : 'border-gray-300'
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShow({ ...show, confirm: !show.confirm })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              {show.confirm ? 'Hide' : 'Show'}
            </button>
          </div>
          {form.confirmPassword && form.newPassword !== form.confirmPassword && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
              <X className="h-3 w-3" />
              Passwords do not match
            </p>
          )}
          {form.confirmPassword && form.newPassword === form.confirmPassword && (
            <p className="mt-1 flex items-center gap-1 text-xs text-green-600">
              <Check className="h-3 w-3" />
              Passwords match
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || form.newPassword !== form.confirmPassword}
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
