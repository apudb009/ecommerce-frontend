import AdminPagination from '@/components/admin/table/AdminPagination';
import { hasPermission } from '@/helpers/checkPermission';
import { useTable } from '@/hooks/useTable';
import api from '@/lib/api';
import { UserPermission, Notification } from '@/lib/types';
import { format } from 'date-fns';
import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

type Props = {
  permissions: UserPermission[];
};

// ── NOTIFICATION HISTORY TAB ────────────────────────
function NotificationHistoryTab({ permissions }: Props) {
  const {
    data: notifications,
    meta,
    loading,
    limit,
    search,
    sort,
    order,
    setPage,
    setSearch,
    setFilter,
    setSort,
    setLimit,
    refresh,
  } = useTable<Notification>({
    endpoint: '/notifications/admin/all',
    defaultSort: 'createdAt',
  });
  //const [notifications, setNotifications] = useState<Notification[]>([]);
  //const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const load = async () => {
  //     try {
  //       const { data } = await api.get('/notifications/admin/all');
  //       setNotifications(data);
  //     } catch {
  //       toast.error('Failed to load notifications');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   void load();
  // }, []);

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

  if (!hasPermission(permissions, 'notifications', 'read')) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-16 text-center">
        <Bell className="mb-3 h-10 w-10 text-red-500" />
        <p className="text-gray-500">You don&apos;t have permission to view notifications</p>
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
      {/* ── PAGINATION ───────────────────────────── */}
      {meta && (
        <AdminPagination
          page={meta.page}
          lastPage={meta.lastPage}
          total={meta.total}
          limit={limit}
          hasNextPage={meta.hasNextPage}
          hasPrevPage={meta.hasPrevPage}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}
    </div>
  );
}

export default NotificationHistoryTab;
