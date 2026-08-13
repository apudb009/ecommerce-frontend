import api from '@/lib/api';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const PasswordTab = () => {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
};

export default PasswordTab;
