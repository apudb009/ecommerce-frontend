'use client';

import api from '@/lib/api';
import { User } from '@/lib/types';
import { toast } from 'sonner';
import { useAdminTable } from '@/hooks/useAdminTable';
import AdminSearch from '@/components/admin/table/AdminSearch';
import AdminPagination from '@/components/admin/table/AdminPagination';
import SortableHeader from '@/components/admin/table/SortableHeader';

const STATUS_OPTIONS = [
  {
    key: 'All',
    value: '',
  },
  {
    key: 'Admin',
    value: 'ADMIN',
  },
  {
    key: 'Customer',
    value: 'CUSTOMER',
  },
];

export default function AdminUsersPage() {
  const {
    data: users,
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
  } = useAdminTable<User>({
    endpoint: '/user',
    defaultSort: 'createdAt',
  });

  const handleRoleChange = async (userId: number, role: 'CUSTOMER' | 'ADMIN') => {
    try {
      await api.patch(`/user/${userId}/role`, { role });
      refresh();
      toast.success('Role updated');
    } catch {
      toast.error('Failed to update role');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        {meta && (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-600">
            {meta.total}
          </span>
        )}
      </div>

      {/* ── TOOLBAR ─────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* search */}
        <AdminSearch
          value={search}
          onChangeAction={setSearch}
          placeholder="Search by email, name..."
        />

        {/* status filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto">
          {STATUS_OPTIONS.map((status, index) => (
            <button
              key={index}
              onClick={() => setFilter('role', status.value || null)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                (new URLSearchParams(window?.location?.search || '').get('role') || '') ===
                status.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.key || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <SortableHeader
                label="User"
                field="name"
                currentSort={sort}
                currentOrder={order}
                onSortAction={setSort}
                className="px-4 py-3"
              />
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {user.name || user.username}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value as 'CUSTOMER' | 'ADMIN')
                      }
                      className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
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
    </div>
  );
}
