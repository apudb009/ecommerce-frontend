import { hasPermission } from '@/helpers/checkPermission';
import api from '@/lib/api';
import { UserPermission, User } from '@/lib/types';
import { Bell, Send, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { QUICK_TEMPLATES } from './constant';
import Preview from './preview';

export type Target = 'all' | 'user';

export type FormProps = {
  title: string;
  message: string;
  link: string;
  target: Target; // 'all' | 'userId'
  query: string;
};

type Props = {
  permissions: UserPermission[];
};

// ── SEND NOTIFICATION TAB ───────────────────────────
function SendNotificationTab({ permissions }: Props) {
  const [form, setForm] = useState<FormProps>({
    title: '',
    message: '',
    link: '',
    target: 'all', // 'all' | 'userId'
    query: '',
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [searching, setSearching] = useState(false);

  const isPermitted = (type: 'create' | 'update' | 'delete' | 'read') => {
    return hasPermission(permissions, 'notifications', type);
  };

  const handleSearchUser = async () => {
    if (!form.query.trim()) return;
    setSearching(true);
    try {
      const { query } = form;
      const { data } = await api.get(`/user/find?query=${query}`);
      setUserInfo(data);
    } catch {
      toast.error('User not found');
      setUserInfo(null);
    } finally {
      setSearching(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    setLoading(true);
    try {
      if (form.target === 'all') {
        // broadcast to all users
        await api.patch('/notifications/broadcast', {
          title: form.title,
          message: form.message,
          link: form.link || undefined,
        });
        toast.success('Notification sent to all users!');
      } else {
        // send to specific user
        if (!userInfo) {
          toast.error('Please search and verify the user first');
          return;
        }
        await api.post('/notifications/send', {
          userId: userInfo.id,
          title: form.title,
          message: form.message,
          link: form.link || undefined,
          type: 'PROMO',
        });
        toast.success(`Notification sent to ${userInfo.name || userInfo.username}`);
      }

      // reset form
      setForm({ title: '', message: '', link: '', target: 'all', query: '' });
      setUserInfo(null);
      setPreview(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* ── FORM ────────────────────────────────────────── */}
      <div className="space-y-4">
        <form onSubmit={handleSend} className="space-y-4">
          {/* target */}
          <div className="rounded-lg border bg-white p-4">
            <label className="mb-2 block text-sm font-semibold text-gray-700">Send To</label>
            <div className="flex gap-3">
              <label
                className={`flex flex-1 cursor-pointer items-center gap-2 rounded-md border p-3 transition ${
                  form.target === 'all'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  value="all"
                  checked={form.target === 'all'}
                  onChange={(e) =>
                    isPermitted('create') && setForm({ ...form, target: e.target.value as Target })
                  }
                  className="text-blue-600"
                />
                <Users className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">All Users</p>
                  <p className="text-xs text-gray-400">Broadcast to everyone</p>
                </div>
              </label>

              <label
                className={`flex flex-1 cursor-pointer items-center gap-2 rounded-md border p-3 transition ${
                  form.target === 'user'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  value="user"
                  checked={form.target === 'user'}
                  onChange={(e) =>
                    isPermitted('create') && setForm({ ...form, target: e.target.value as Target })
                  }
                  className="text-blue-600"
                />
                <Bell className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Specific User</p>
                  <p className="text-xs text-gray-400">Target one person</p>
                </div>
              </label>
            </div>

            {/* user search */}
            {form.target === 'user' && (
              <div className="mt-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter User ID or Username or Email or Name"
                    value={form.query}
                    onChange={(e) => {
                      setForm({ ...form, query: e.target.value });
                      setUserInfo(null);
                    }}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleSearchUser}
                    disabled={searching}
                    className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                  >
                    {searching ? 'Searching...' : 'Find'}
                  </button>
                </div>

                {userInfo && (
                  <div className="mt-2 flex items-center gap-2 rounded-md bg-green-50 px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {(userInfo.name || userInfo.username).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {userInfo.name || userInfo.username}
                      </p>
                      <p className="text-xs text-gray-500">{userInfo.email}</p>
                    </div>
                    <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                      Found ✓
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* message content */}
          <div className="rounded-lg border bg-white p-4 space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Message Content</label>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Big Sale This Weekend!"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="e.g. Get up to 50% off on selected products."
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Link (optional)
              </label>
              <input
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="e.g. /products"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => isPermitted('create') && setPreview((s) => !s)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {preview ? 'Hide Preview' : 'Preview'}
            </button>
            <button
              type="submit"
              disabled={loading || isPermitted('create') === false}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {loading
                ? 'Sending...'
                : form.target === 'all'
                  ? 'Broadcast to All Users'
                  : 'Send to User'}
            </button>
          </div>
        </form>

        {/* quick templates */}
        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Quick Templates</h3>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_TEMPLATES.map((template) => (
              <button
                key={template.label}
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    title: template.title,
                    message: template.message,
                    link: template.link,
                  }))
                }
                className="rounded-md border border-gray-200 px-3 py-2 text-left text-xs text-gray-600 hover:border-blue-300 hover:bg-blue-50"
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── PREVIEW ─────────────────────────────────────── */}
      {preview && <Preview form={form} userInfo={userInfo} />}
    </div>
  );
}

export default SendNotificationTab;
