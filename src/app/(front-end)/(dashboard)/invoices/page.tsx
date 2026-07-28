'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Invoice } from '@/lib/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { FileText, Download } from 'lucide-react';

const STATUS_COLORS = {
  PAID: 'bg-green-100 text-green-700',
  UNPAID: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const { data } = await api.get('/invoices');
        setInvoices(data);
      } catch {
        toast.error('Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };

    void fetchInvoices();
  }, []);

  const handleDownload = async (invoice: Invoice) => {
    setDownloading(invoice.id);
    try {
      const response = await api.get(`/invoices/${invoice.id}/pdf`, {
        responseType: 'blob',
      });

      // create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoice.invoiceNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Invoice downloaded');
    } catch {
      toast.error('Failed to download invoice');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Invoices</h1>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-20 text-center">
          <FileText className="mb-3 h-12 w-12 text-gray-300" />
          <h2 className="text-lg font-medium text-gray-700">No invoices yet</h2>
          <p className="mt-1 text-sm text-gray-500">
            Invoices are generated automatically when you place an order
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Invoice No</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{invoice.invoiceNo}</td>
                  <td className="px-4 py-3 text-gray-500">#{invoice.order.id}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {format(new Date(invoice.issuedAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    ${Number(invoice.order.grandTotalAmount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[invoice.status]}`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDownload(invoice)}
                      disabled={downloading === invoice.id}
                      className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 ml-auto"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {downloading === invoice.id ? 'Generating...' : 'PDF'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
