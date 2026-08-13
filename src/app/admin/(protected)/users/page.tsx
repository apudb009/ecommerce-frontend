'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useTable } from '@/hooks/useTable';
import AdminSearch from '@/components/admin/table/AdminSearch';
import AdminPagination from '@/components/admin/table/AdminPagination';
import SortableHeader from '@/components/admin/table/SortableHeader';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Users, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { User } from '@/lib/types';
import { useRoleStore } from '@/store/roleStore';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/helpers/checkPermission';
import DeleteModal from '@/components/ui/DeleteModal';
import UserFormModal from './modal/form';
import UserDetailModal from './modal/details';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  CUSTOMER: 'bg-green-100 text-green-600',
  MANAGER: 'bg-blue-100 text-blue-700',
  EDITOR: 'bg-green-100 text-green-700',
};

export default function AdminUsersClient() {
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
  } = useTable<User>({
    endpoint: '/user/admin/all',
    defaultSort: 'createdAt',
  });

  const { roles, fetchRoles } = useRoleStore();
  const { permissions } = useAuthStore();

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [activeUser, setActiveUser] = useState<User>();

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const roleFilter =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('role') || ''
      : '';

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/user/admin/${id}`);
      toast.success('User deleted');
      refresh();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setActiveUser(undefined);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          {meta && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-600">
              {meta.total}
            </span>
          )}
        </div>
        {hasPermission(permissions, 'users', 'create') && (
          <button
            onClick={() => {
              setEditingUser(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        )}
      </div>

      {/* ── TOOLBAR ─────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AdminSearch
          value={search}
          onChangeAction={setSearch}
          placeholder="Search by name, email, username..."
        />

        {/* role filter */}
        <div className="flex gap-1.5">
          {roles &&
            [{ name: '' }, { name: 'CUSTOMER' }, ...roles].map((role, index) => (
              <button
                key={index}
                onClick={() => setFilter('role', role.name || null)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  roleFilter === role.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {role.name || 'All Roles'}
              </button>
            ))}
        </div>
      </div>

      {/* ── TABLE ───────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">User</th>
              <SortableHeader
                label="Joined"
                field="createdAt"
                currentSort={sort}
                currentOrder={order}
                onSortAction={setSort}
              />
              <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Role</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              Array.from({ length: limit }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 animate-pulse rounded bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <Users className="mx-auto mb-2 h-8 w-8 text-gray-200" />
                  <p className="text-gray-400">No users found</p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  {/* user info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name || user.username}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* joined */}
                  <td className="px-4 py-3 text-gray-500">
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </td>

                  {/* role */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {user.role}
                      </span>
                      {user.userRole && user.userRole.name !== user.role && (
                        <span className="text-xs text-gray-400">({user.userRole.name})</span>
                      )}
                    </div>
                  </td>

                  {/* actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {hasPermission(permissions, 'users', 'read') && (
                        <button
                          onClick={() => setViewingUser(user)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {hasPermission(permissions, 'users', 'update') && (
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setShowModal(true);
                          }}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                          title="Edit user"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      {hasPermission(permissions, 'users', 'delete') && (
                        <button
                          onClick={() => setActiveUser(user)}
                          disabled={activeUser?.id === user.id || user?.userRole?.isSystem}
                          className={`rounded-md p-1.5 text-gray-400 hover:bg-gray-100 ${!user?.userRole?.isSystem && 'hover:text-red-600'} disabled:opacity-50`}
                          title="Delete user"
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

        {/* pagination */}
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

      {/* modals */}
      {showModal && (
        <UserFormModal
          roles={roles}
          user={editingUser}
          onClose={() => {
            setShowModal(false);
            setEditingUser(null);
          }}
          onSaved={() => {
            setShowModal(false);
            refresh();
          }}
        />
      )}

      {activeUser && (
        <DeleteModal
          isOpen={!!activeUser}
          title="Delete user"
          text={`Are you sure you want to delete this user "${activeUser.name || activeUser.username}" ?`}
          onConfirm={() => handleDelete(activeUser.id)}
          onClose={() => setActiveUser(undefined)}
        />
      )}

      {viewingUser && (
        <UserDetailModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
          onEdit={() => {
            setEditingUser(viewingUser);
            setViewingUser(null);
            setShowModal(true);
          }}
        />
      )}
    </div>
  );
}
