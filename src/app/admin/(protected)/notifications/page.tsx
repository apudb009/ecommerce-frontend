'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Bell, Send, Users, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { User, Notification } from '@/lib/types';

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Bell className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      </div>

      {/* ── TABS ────────────────────────────────────────── */}
      <div className="mb-6 flex border-b">
        {[
          { key: 'send', label: 'Send Notification', icon: Send },
          { key: 'history', label: 'Recent Activity', icon: Eye },
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

      {activeTab === 'send' && <SendNotificationTab />}
      {activeTab === 'history' && <NotificationHistoryTab />}
    </div>
  );
}

// ── SEND NOTIFICATION TAB ───────────────────────────
function SendNotificationTab() {
  const [form, setForm] = useState({
    title: '',
    message: '',
    link: '',
    target: 'all', // 'all' | 'userId'
    userId: '',
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearchUser = async () => {
    if (!form.userId.trim()) return;
    setSearching(true);
    try {
      const id = parseInt(form.userId);
      if (isNaN(id)) {
        toast.error('Please enter a valid user ID');
        return;
      }
      const { data } = await api.get(`/user/${id}`);
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
      setForm({ title: '', message: '', link: '', target: 'all', userId: '' });
      setUserInfo(null);
      setPreview(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const QUICK_TEMPLATES = [
    {
      label: '🛍️ Sale Announcement',
      title: 'Big Sale This Weekend!',
      message: 'Get up to 50% off on selected products. Limited time only!',
      link: '/products',
    },
    {
      label: '🎟️ New Coupon',
      title: 'Exclusive Coupon Just For You!',
      message: 'Use code SAVE20 for 20% off your next order.',
      link: '/products',
    },
    {
      label: '📦 New Products',
      title: 'New Products Just Arrived!',
      message: 'Check out our latest arrivals and be the first to shop.',
      link: '/products',
    },
    {
      label: '⭐ Leave a Review',
      title: 'How Was Your Order?',
      message: "We'd love to hear your feedback. Leave a review on your recent purchase.",
      link: '/orders',
    },
  ];

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
                  onChange={(e) => setForm({ ...form, target: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, target: e.target.value })}
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
                    type="number"
                    placeholder="Enter User ID"
                    value={form.userId}
                    onChange={(e) => {
                      setForm({ ...form, userId: e.target.value });
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
              onClick={() => setPreview((s) => !s)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {preview ? 'Hide Preview' : 'Preview'}
            </button>
            <button
              type="submit"
              disabled={loading}
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
      {preview && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Preview</h3>

          {/* notification bell preview */}
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-medium text-gray-400 uppercase">
              How it appears in notification bell
            </p>
            <div className="flex gap-3 rounded-md bg-blue-50 p-3">
              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {form.title || 'Notification Title'}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {form.message || 'Your notification message will appear here.'}
                </p>
                {form.link && <p className="mt-0.5 text-xs text-blue-500">→ {form.link}</p>}
                <p className="mt-1 text-xs text-gray-400">just now</p>
              </div>
            </div>

            <div className="mt-4 rounded-md bg-gray-50 p-3 text-xs text-gray-500">
              <p className="font-medium text-gray-700 mb-1">Send Summary:</p>
              <p>
                Target:{' '}
                <strong>
                  {form.target === 'all'
                    ? 'All users'
                    : userInfo
                      ? userInfo.name || userInfo.username
                      : 'No user selected'}
                </strong>
              </p>
              {form.link && (
                <p>
                  Link: <strong>{form.link}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── NOTIFICATION HISTORY TAB ────────────────────────
function NotificationHistoryTab() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/notifications/admin/all');
        setNotifications(data);
      } catch {
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-16 text-center">
        <Bell className="mb-3 h-10 w-10 text-gray-300" />
        <p className="text-gray-500">No notifications sent yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Message</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Read</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {notifications.map((n) => (
            <tr key={n.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{n.title}</td>
              <td className="max-w-50 truncate px-4 py-3 text-gray-500">{n.message}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                  {n.type}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500">
                {n.user?.name || n.user?.username || `#${n.user.id}`}
              </td>
              <td className="px-4 py-3 text-gray-400">
                {format(new Date(n.createdAt), 'MMM d, h:mm a')}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    n.isRead ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {n.isRead ? 'Read' : 'Unread'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
