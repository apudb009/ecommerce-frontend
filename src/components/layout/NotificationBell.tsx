'use client';

import { useEffect, useState, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

export default function NotificationBell() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications/my');
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch {
        // silent
      }
    };

    if (!user) return;
    void fetchNotifications();

    // poll every 30 seconds
    const interval = setInterval(() => {
      void fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, open]);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      const wasUnread = notifications.find((n) => n.id === id)?.isRead === false;
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  };

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      {/* bell button */}
      <button
        onClick={() => {
          setOpen((s) => !s);
          //if (!open) void fetchNotifications();
        }}
        className="relative pt-2 text-gray-700 hover:text-blue-600"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* dropdown */}
      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-lg border bg-white shadow-xl">
          {/* header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                <Check className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* list */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="mx-auto mb-2 h-8 w-8 text-gray-200" />
                <p className="text-sm text-gray-400">No notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) void handleMarkAsRead(n.id);
                  }}
                  className={`group relative flex gap-3 px-4 py-3 transition hover:bg-gray-50 ${
                    !n.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* unread dot */}
                  {!n.isRead && (
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                  )}
                  {n.isRead && <div className="mt-1.5 h-2 w-2 shrink-0" />}

                  <div className="flex-1 min-w-0">
                    {n.link ? (
                      <Link href={n.link} onClick={() => setOpen(false)}>
                        <p className="text-sm font-medium text-gray-900 hover:text-blue-600">
                          {n.title}
                        </p>
                      </Link>
                    ) : (
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    )}
                    <p className="mt-0.5 text-xs text-gray-500">{n.message}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  {/* delete */}
                  <button
                    onClick={(e) => handleDelete(n.id, e)}
                    className="shrink-0 text-gray-300 opacity-0 hover:text-red-500 group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
