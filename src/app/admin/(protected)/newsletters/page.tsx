'use client';

import api from '@/lib/api';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Newsletter } from '@/lib/types';
import { useAdminTable } from '@/hooks/useAdminTable';
import AdminPagination from '@/components/admin/table/AdminPagination';
import SortableHeader from '@/components/admin/table/SortableHeader';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/helpers/checkPermission';
import RestrictedAccess from '@/components/admin/RestrictedAccess';
import { useState } from 'react';
import DeleteModal from '@/components/ui/DeleteModal';

export default function AdminNewslettersPage() {
  const {
    data: newsletters,
    meta,
    loading,
    limit,
    sort,
    order,
    setPage,
    setSort,
    setLimit,
    refresh,
  } = useAdminTable<Newsletter>({
    endpoint: '/newsletters',
    defaultSort: 'createdAt',
  });

  const { permissions } = useAuthStore();
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter>();

  const handleDelete = async (id: number) => {
    const hasActionPermission = hasPermission(permissions, 'newsletters', 'delete');
    if (!hasActionPermission) {
      toast.error('You do not have permission to delete newsletters');
      return;
    }
    try {
      await api.delete(`/newsletters/${id}`);
      refresh();
      toast.success('Newsletters deleted');
    } catch {
      toast.error('Failed to delete newsletters');
    } finally {
      setSelectedNewsletter(undefined);
    }
  };

  const handleToggle = async (newsletter: Newsletter) => {
    try {
      const hasActionPermission = hasPermission(permissions, 'newsletters', 'update');
      if (!hasActionPermission) {
        toast.error('You do not have permission to update newsletters');
        return;
      }
      await api.patch(`/newsletters/${newsletter.id}`, {
        isActive: !newsletter.isActive,
      });
      refresh();
    } catch {
      toast.error('Failed to update newsletters');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Newsletters</h1>
        {meta && (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-600">
            {meta.total}
          </span>
        )}
      </div>
      {hasPermission(permissions, 'newsletters', 'read') ? (
        <>
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <SortableHeader
                    label="Email"
                    field="email"
                    currentSort={sort}
                    currentOrder={order}
                    onSortAction={setSort}
                    className="px-4 py-3"
                  />
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : newsletters.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                      No data found!!
                    </td>
                  </tr>
                ) : (
                  newsletters.map((newsletter) => (
                    <tr key={newsletter.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-gray-100 px-2 py-1 font-mono text-sm font-bold">
                          {newsletter.email}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggle(newsletter)}
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            newsletter.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {newsletter.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setSelectedNewsletter(newsletter)}
                            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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
        </>
      ) : (
        <RestrictedAccess />
      )}
      {selectedNewsletter && (
        <DeleteModal
          isOpen={!!selectedNewsletter}
          title="Delete newsletter"
          text="Are you sure you want to delete this newsletter?"
          loading={loading}
          onClose={() => setSelectedNewsletter(undefined)}
          onConfirm={() => handleDelete(selectedNewsletter.id)}
        />
      )}
    </div>
  );
}
