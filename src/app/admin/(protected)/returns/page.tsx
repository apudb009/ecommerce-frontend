'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { RotateCcw } from 'lucide-react';
import { ReturnRequest } from '@/lib/types';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-green-100 text-green-700',
};

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ReturnRequest | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/returns/admin/all');
        setReturns(data);
      } catch {
        toast.error('Failed to load returns');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleUpdateStatus = async (id: number, status: string, adminNote?: string) => {
    try {
      const { data } = await api.patch(`/returns/${id}/status`, { status, adminNote });
      setReturns((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
      setSelected(null);
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <RotateCcw className="h-6 w-6 text-orange-500" />
        <h1 className="text-2xl font-bold text-gray-900">Return Requests</h1>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : returns.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No return requests yet
                </td>
              </tr>
            ) : (
              returns.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">#{r.id}</td>
                  <td className="px-4 py-3 text-gray-600">{r.user?.name || r.user?.email}</td>
                  <td className="px-4 py-3 text-gray-500">#{r.order?.id}</td>
                  <td className="px-4 py-3 text-gray-600">{r.reason.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {format(new Date(r.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.status === 'PENDING' && (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'APPROVED')}
                          className="rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'REJECTED')}
                          className="rounded-md bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {r.status === 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'REFUNDED')}
                        className="rounded-md bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                      >
                        Mark Refunded
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
