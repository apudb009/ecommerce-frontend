import api from '@/lib/api';
import { ACTIONS, MODULES, MODULE_LABELS } from '@/lib/permissions.config';
import { Role } from '@/lib/types';
import { Shield } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
  role: Role | null;
  onClose: () => void;
  onSaved: (role: Role) => void;
};

// ── ROLE MODAL ─────────────────────────────────────
function RoleModal({ role, onClose, onSaved }: Props) {
  const isEdit = !!role;

  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [selected, setSelected] = useState<Set<string>>(
    new Set(
      role?.permissions?.map((rp) => `${rp.permission.module}:${rp.permission.action}`) || [],
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export default RoleModal;
