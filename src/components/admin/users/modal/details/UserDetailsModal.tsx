import { User } from '@/lib/types';
import { Edit2 } from 'lucide-react';
import { FC } from 'react';

type Props = {
  user: User;
  onClose: () => void;
  onEdit: () => void;
};

// ── USER DETAIL MODAL ───────────────────────────────
const UserDetailModal: FC<Props> = ({ user, onClose, onEdit }) => {
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
                  : user.role === 'CUSTOMER'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-600'
              }`}
            >
              {user.role}
            </span>
          </div>
        </div>

        {/* stats */}
        {user.role === 'CUSTOMER' && (
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
        )}

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
};

export default UserDetailModal;
