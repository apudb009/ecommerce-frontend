'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { Invoice } from '@/lib/types';

const STATUS_COLORS = {
  PAID: 'bg-green-100 text-green-700',
  UNPAID: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/invoices/admin/all');
        setInvoices(data);
      } catch {
        toast.error('Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleDownload = async (invoice: Invoice) => {
    setDownloading(invoice.id);
    try {
      const response = await api.get(`/invoices/${invoice.id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoice.invoiceNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Downloaded');
    } catch {
      toast.error('Failed to download');
    } finally {
      setDownloading(null);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const { data } = await api.patch(`/invoices/${id}/status`, { status });
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status: data.status } : inv)),
      );
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Invoices</h1>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Amount</th>
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
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{invoice.invoiceNo}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {invoice.user?.name || invoice.user?.email}
                  </td>
                  <td className="px-4 py-3 text-gray-500">#{invoice.order?.id}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {format(new Date(invoice.issuedAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    ${Number(invoice.order?.grandTotalAmount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={invoice.status}
                      onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                      className={`rounded-full px-2 py-1 text-xs font-medium border-0 ${STATUS_COLORS[invoice.status as keyof typeof STATUS_COLORS]}`}
                    >
                      <option value="UNPAID">UNPAID</option>
                      <option value="PAID">PAID</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDownload(invoice)}
                      disabled={downloading === invoice.id}
                      className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 ml-auto"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </button>
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
