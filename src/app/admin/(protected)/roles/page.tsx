/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Shield, Plus, Edit2, Trash2, Lock, Users } from 'lucide-react';
import { MODULES, ACTIONS, MODULE_LABELS } from '@/lib/permissions.config';
import { Permission, Role } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/helpers/checkPermission';
import DeleteModal from '@/components/ui/DeleteModal';

export default function AdminRolesClient() {
  const { permissions: userPermissions } = useAuthStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [activeRole, setActiveRole] = useState<Role>();

  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/roles'),
        api.get('/roles/permissions'),
      ]);
      setRoles(rolesRes.data);
      setPermissions(permsRes.data);
    } catch {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchData();
    };
    load();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/roles/${id}`);
      setRoles((prev) => prev.filter((r) => r.id !== id));
      toast.success('Role deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete role');
    } finally {
      setActiveRole(undefined);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
        </div>
        {hasPermission(userPermissions, 'roles', 'create') && (
          <button
            onClick={() => {
              setEditing(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            New Role
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {hasPermission(userPermissions, 'roles', 'read') ? (
            roles.map((role) => (
              <div
                key={role.id}
                className={`rounded-xl border bg-white p-5 shadow-sm ${
                  role.isSystem ? 'border-purple-200' : ''
                }`}
              >
                {/* header */}
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{role.name}</h3>
                      {role.isSystem && (
                        <span className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                          <Lock className="h-2.5 w-2.5" />
                          System
                        </span>
                      )}
                    </div>
                    {role.description && (
                      <p className="mt-0.5 text-xs text-gray-400">{role.description}</p>
                    )}
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                      <Users className="h-3 w-3" />
                      {role._count?.users ?? 0} users
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {hasPermission(userPermissions, 'roles', 'update') && (
                      <button
                        onClick={() => {
                          setEditing(role);
                          setShowModal(true);
                        }}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                    {!role.isSystem && hasPermission(userPermissions, 'roles', 'delete') && (
                      <button
                        onClick={() => setActiveRole(role)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* permissions grid */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-gray-400">
                    PERMISSIONS ({role.permissions?.length ?? 0})
                  </p>
                  <div className="max-h-40 overflow-y-auto">
                    {MODULES.slice(0, 8).map((module) => {
                      const modulePerms =
                        role.permissions?.filter((rp: any) => rp.permission.module === module) ||
                        [];
                      if (modulePerms.length === 0) return null;

                      return (
                        <div key={module} className="flex items-center gap-2 py-0.5">
                          <span className="w-24 shrink-0 text-xs text-gray-500">
                            {MODULE_LABELS[module] || module}
                          </span>
                          <div className="flex gap-1">
                            {ACTIONS.map((action) => {
                              const hasPerm = modulePerms.some(
                                (rp: any) => rp.permission.action === action,
                              );
                              return (
                                <span
                                  key={action}
                                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                    hasPerm
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-300'
                                  }`}
                                >
                                  {action[0].toUpperCase()}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Lock className="h-6 w-6" />
              <p className="text-sm text-red-500">You don&apos;t have permission to view roles</p>
            </div>
          )}
        </div>
      )}

      {activeRole && (
        <DeleteModal
          isOpen={!!activeRole}
          onClose={() => setActiveRole(undefined)}
          title="Delete Role"
          text={`Are you sure you want to delete this role "${activeRole.name}"?`}
          onConfirm={() => handleDelete(activeRole.id)}
        />
      )}

      {showModal && (
        <RoleModal
          role={editing}
          permissions={permissions}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSaved={(saved) => {
            if (editing) {
              setRoles((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
            } else {
              setRoles((prev) => [...prev, saved]);
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

// ── ROLE MODAL ─────────────────────────────────────
function RoleModal({
  role,
  permissions,
  onClose,
  onSaved,
}: {
  role: Role | null;
  permissions: Permission[];
  onClose: () => void;
  onSaved: (role: Role) => void;
}) {
  const isEdit = !!role;

  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [selected, setSelected] = useState<Set<string>>(
    new Set(
      role?.permissions?.map((rp: any) => `${rp.permission.module}:${rp.permission.action}`) || [],
    ),
  );
  const [loading, setLoading] = useState(false);

  const toggle = (module: string, action: string) => {
    const key = `${module}:${action}`;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleModule = (module: string) => {
    const allSelected = ACTIONS.every((a) => selected.has(`${module}:${a}`));
    setSelected((prev) => {
      const next = new Set(prev);
      ACTIONS.forEach((a) => {
        if (allSelected) next.delete(`${module}:${a}`);
        else next.add(`${module}:${a}`);
      });
      return next;
    });
  };

  const selectAll = () => {
    const all = new Set(MODULES.flatMap((m) => ACTIONS.map((a) => `${m}:${a}`)));
    setSelected(all);
  };

  const clearAll = () => setSelected(new Set());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Role name is required');
      return;
    }
    setLoading(true);

    const perms = Array.from(selected).map((key) => {
      const [module, action] = key.split(':');
      return { module, action };
    });

    try {
      const { data } = isEdit
        ? await api.patch(`/roles/${role.id}`, { name, description, permissions: perms })
        : await api.post('/roles', { name, description, permissions: perms });
      toast.success(isEdit ? 'Role updated' : 'Role created');
      onSaved(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save role');
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
        className="flex h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="border-b p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Shield className="h-5 w-5 text-purple-600" />
            {isEdit ? `Edit Role: ${role.name}` : 'Create New Role'}
          </h2>
        </div>

        {/* scrollable body */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Role Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                placeholder="MANAGER"
                disabled={role?.isSystem}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Role description"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* permissions matrix */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                Permissions
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ({selected.size} selected)
                </span>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs font-medium text-red-500 hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* legend */}
            <div className="mb-3 flex items-center gap-3 text-xs text-gray-400">
              {ACTIONS.map((a) => (
                <span key={a} className="flex items-center gap-1">
                  <span className="font-bold">{a[0].toUpperCase()}</span>= {a}
                </span>
              ))}
            </div>

            {/* matrix table */}
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                      Module
                    </th>
                    {ACTIONS.map((action) => (
                      <th
                        key={action}
                        className="px-3 py-2 text-center text-xs font-semibold capitalize text-gray-500"
                      >
                        {action}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">
                      All
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {MODULES.map((module) => {
                    const allSelected = ACTIONS.every((a) => selected.has(`${module}:${a}`));
                    const someSelected = ACTIONS.some((a) => selected.has(`${module}:${a}`));

                    return (
                      <tr key={module} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-700">
                          {MODULE_LABELS[module] || module}
                        </td>
                        {ACTIONS.map((action) => {
                          const key = `${module}:${action}`;
                          const checked = selected.has(key);
                          return (
                            <td key={action} className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggle(module, action)}
                                className="h-4 w-4 cursor-pointer rounded text-purple-600 focus:ring-purple-500"
                              />
                            </td>
                          );
                        })}
                        {/* toggle all for module */}
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = someSelected && !allSelected;
                            }}
                            onChange={() => toggleModule(module)}
                            className="h-4 w-4 cursor-pointer rounded text-purple-600 focus:ring-purple-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="flex justify-end gap-2 border-t p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Role' : 'Create Role'}
          </button>
        </div>
      </div>
    </div>
  );
}
