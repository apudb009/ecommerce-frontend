/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Shield, Plus, Edit2, Trash2, Lock, Users } from 'lucide-react';
import { Role } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/helpers/checkPermission';
import DeleteModal from '@/components/ui/DeleteModal';
import RoleModal from './modal/roleModal';
import PermissionGrid from './permissions/grid';

export default function AdminRolesClient() {
  const { permissions: userPermissions } = useAuthStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [activeRole, setActiveRole] = useState<Role>();

  const fetchData = async () => {
    try {
      const [rolesRes] = await Promise.all([api.get('/roles'), api.get('/roles/permissions')]);
      setRoles(rolesRes.data);
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
                <PermissionGrid role={role} />
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
