'use client';

import { useEffect, useState } from 'react';
import { format, set } from 'date-fns';
import { useAdminTable } from '@/hooks/useAdminTable';
import AdminSearch from '@/components/admin/table/AdminSearch';
import AdminPagination from '@/components/admin/table/AdminPagination';
import SortableHeader from '@/components/admin/table/SortableHeader';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Users, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { Role, User } from '@/lib/types';
import { useRoleStore } from '@/store/roleStore';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/helpers/checkPermission';
import DeleteModal from '@/components/ui/DeleteModal';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  CUSTOMER: 'bg-gray-100 text-gray-600',
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
  } = useAdminTable<User>({
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
          {['', 'ADMIN', 'CUSTOMER'].map((role) => (
            <button
              key={role}
              onClick={() => setFilter('role', role || null)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                roleFilter === role
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {role || 'All Roles'}
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
        <UserModal
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

// ── USER FORM MODAL ─────────────────────────────────
function UserModal({
  user,
  onClose,
  onSaved,
  roles,
}: {
  user: User | null;
  roles: Role[] | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    role: user?.role || 'CUSTOMER',
    password: '',
    roleId: user?.userRole?.id ?? null,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        const payload: Partial<User> = { ...form };
        if (!payload.password) delete payload.password;
        await api.patch(`/user/admin/${user.id}`, payload);
        toast.success('User updated');
      } else {
        if (!form.password) {
          toast.error('Password is required');
          return;
        }
        await api.post('/user/admin', form);
        toast.success('User created');
      }
      onSaved();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Users className="h-5 w-5 text-blue-600" />
          {isEdit ? 'Edit User' : 'Create User'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Full Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Username</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="johndoe"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john@example.com"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              {isEdit ? 'New Password (leave blank to keep)' : 'Password'}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required={!isEdit}
              minLength={8}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Role</label>
            <select
              value={form.roleId || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  roleId: Number(e.target.value),
                  role: roles?.find((r) => r.id === Number(e.target.value))?.name || 'CUSTOMER',
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {roles &&
                roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── USER DETAIL MODAL ───────────────────────────────
function UserDetailModal({
  user,
  onClose,
  onEdit,
}: {
  user: User;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* avatar */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
            {(user.name || user.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{user.name || user.username}</h2>
            <p className="text-sm text-gray-400">{user.email}</p>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                user.role === 'ADMIN'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {user.role}
            </span>
          </div>
        </div>

        {/* stats */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Orders', value: user._count?.orders ?? 0 },
            { label: 'Reviews', value: user._count?.reviews ?? 0 },
            { label: 'Wishlist', value: user._count?.wishlist ?? 0 },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg bg-gray-50 p-3 text-center">
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* permissions preview */}
        {user.userRole?.permissions?.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold text-gray-500">
              PERMISSIONS ({user.userRole.permissions.length})
            </p>
            <div className="max-h-32 overflow-y-auto rounded-lg bg-gray-50 p-2">
              <div className="flex flex-wrap gap-1">
                {user.userRole.permissions.map((rp) => (
                  <span
                    key={`${rp.permission.module}:${rp.permission.action}`}
                    className="rounded bg-white px-1.5 py-0.5 text-xs text-gray-600 shadow-sm"
                  >
                    {rp.permission.module}:{rp.permission.action}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Edit2 className="h-4 w-4" />
            Edit User
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
