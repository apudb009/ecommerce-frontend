import { ACTIONS, MODULE_LABELS, MODULES } from '@/lib/permissions.config';
import { Role } from '@/lib/types';
import { FC } from 'react';

type Props = {
  role: Role;
};

const PermissionGrid: FC<Props> = ({ role }) => {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-gray-400">
        PERMISSIONS ({role.permissions?.length ?? 0})
      </p>
      <div className="max-h-40 overflow-y-auto">
        {MODULES.slice(0, 8).map((module) => {
          const modulePerms =
            role.permissions?.filter((rp) => rp.permission.module === module) || [];
          if (modulePerms.length === 0) return null;

          return (
            <div key={module} className="flex items-center gap-2 py-0.5">
              <span className="w-24 shrink-0 text-xs text-gray-500">
                {MODULE_LABELS[module] || module}
              </span>
              <div className="flex gap-1">
                {ACTIONS.map((action) => {
                  const hasPerm = modulePerms.some((rp) => rp.permission.action === action);
                  return (
                    <span
                      key={action}
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        hasPerm ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-300'
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
  );
};

export default PermissionGrid;
