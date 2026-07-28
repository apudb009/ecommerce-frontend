/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Order, OrderStatus } from '@/lib/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import OrderTimeline from '@/components/order/OrderTimeline';
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Download,
} from 'lucide-react';

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  PAID: 'bg-blue-100 text-blue-700 border-blue-200',
  PROCESSING: 'bg-purple-100 text-purple-700 border-purple-200',
  SHIPPED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  REFUNDED: 'bg-gray-100 text-gray-700 border-gray-200',
};

const PROGRESS_STEPS: { status: OrderStatus; label: string; icon: any }[] = [
  { status: 'PENDING', label: 'Order Placed', icon: Clock },
  { status: 'PAID', label: 'Payment Confirmed', icon: CreditCard },
  { status: 'PROCESSING', label: 'Processing', icon: Package },
  { status: 'SHIPPED', label: 'Shipped', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

const STATUS_ORDER: Record<OrderStatus, number> = {
  PENDING: 0,
  PAID: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: -1,
  REFUNDED: -1,
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [tracking, setTracking] = useState<any>(null);

  const [showReturnModal, setShowReturnModal] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const [orderRes, trackingRes] = await Promise.all([
        api.get(`/orders/${orderId}`),
        api.get(`/orders/${orderId}/tracking`),
      ]);
      setOrder(orderRes.data);
      setTracking(trackingRes.data);
    } catch {
      toast.error('Order not found');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    const load = async () => {
      await fetchOrder();
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    try {
      const { data } = await api.patch(`/orders/${orderId}/cancel`);
      setOrder(data);
      toast.success('Order cancelled');
    } catch (err: any) {
      toast.error(err.response?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      // first check if invoice exists, create if not
      let invoiceId: number;

      try {
        const { data: existing } = await api.get(`/invoices`);
        const invoice = existing.find((inv: any) => inv.orderId === orderId);
        if (invoice) {
          invoiceId = invoice.id;
        } else {
          const { data: created } = await api.post(`/invoices/order/${orderId}`);
          invoiceId = created.id;
        }
      } catch {
        const { data: created } = await api.post(`/invoices/order/${orderId}`);
        invoiceId = created.id;
      }

      const response = await api.get(`/invoices/${invoiceId}/pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-order-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Invoice downloaded');
    } catch {
      toast.error('Failed to download invoice');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!order) return null;

  const currentStep = STATUS_ORDER[order.status];
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED';
  const canCancel = order.status === 'PENDING';

  return (
    <div className="max-w-3xl">
      {/* ── BACK ────────────────────────────────────────── */}
      <button
        onClick={() => router.push('/orders')}
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        All Orders
      </button>

      {/* ── HEADER ──────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
          <p className="mt-1 text-sm text-gray-400">
            Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy')}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-sm font-medium ${STATUS_COLORS[order.status]}`}
        >
          {order.status}
        </span>
      </div>

      {/* ── TRACKING TIMELINE ──────────────────────────── */}
      {tracking && (
        <div className="mb-4">
          <OrderTimeline timeline={tracking.timeline} trackingNumber={tracking.trackingNumber} />
        </div>
      )}

      {/* ── PROGRESS TRACKER ──────────────────────────────── */}
      {!isCancelled && (
        <div className="mb-6 rounded-lg border bg-white p-5">
          <div className="relative flex justify-between">
            {/* progress line */}
            <div className="absolute left-0 top-5 h-0.5 w-full bg-gray-200" />
            <div
              className="absolute left-0 top-5 h-0.5 bg-blue-600 transition-all"
              style={{ width: `${(currentStep / (PROGRESS_STEPS.length - 1)) * 100}%` }}
            />

            {PROGRESS_STEPS.map((step, i) => {
              const Icon = step.icon;
              const isDone = currentStep >= i;
              const isCurrent = currentStep === i;

              return (
                <div key={step.status} className="relative flex flex-col items-center">
                  <div
                    className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      isDone
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 bg-white text-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className={`mt-2 text-center text-xs ${
                      isCurrent
                        ? 'font-semibold text-blue-600'
                        : isDone
                          ? 'text-gray-600'
                          : 'text-gray-300'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CANCELLED BANNER ──────────────────────────────── */}
      {isCancelled && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <XCircle className="h-6 w-6 shrink-0 text-red-500" />
          <div>
            <p className="font-medium text-red-700">Order {order.status.toLowerCase()}</p>
            <p className="text-sm text-red-500">
              {order.status === 'REFUNDED'
                ? 'Your refund will appear within 5-7 business days.'
                : 'This order has been cancelled.'}
            </p>
          </div>
        </div>
      )}

      {/* ── ORDER ITEMS ───────────────────────────────────── */}
      <div className="mb-4 rounded-lg border bg-white p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
          <Package className="h-4 w-4" />
          Items Ordered
        </h2>

        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{item.productName}</p>
                {item.variant && (
                  <p className="text-xs text-gray-800">
                    Variant: {item.variant.name} - {item.variant.value}
                  </p>
                )}
                {/* ← show flash sale savings */}
                {item.salePrice && Number(item.salePrice) < Number(item.unitPrice) ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400 line-through">
                      ${Number(item.unitPrice).toFixed(2)}
                    </span>
                    <span className="text-xs font-medium text-red-500">
                      ${Number(item.salePrice).toFixed(2)} 🔥
                    </span>
                    <span className="text-xs text-gray-400">× {item.quantity}</span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    ${Number(item.unitPrice).toFixed(2)} × {item.quantity}
                  </p>
                )}
              </div>
              <p className="shrink-0 font-medium text-gray-900">${Number(item.total).toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* totals */}
        <div className="mt-4 space-y-1 border-t pt-4 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>${Number(order.totalAmount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Shipping</span>
            <span>{Number(order.totalAmount) > 50 ? 'Free' : '$9.99'}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Tax</span>
            <span>{Number(order.taxAmount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
            <span>Total</span>
            <span>${Number(order.grandTotalAmount).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ── DELIVERY ADDRESS ──────────────────────────────── */}
      <div className="mb-4 rounded-lg border bg-white p-5">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
          <MapPin className="h-4 w-4" />
          Delivery Address
        </h2>
        <p className="text-sm text-gray-600">
          {order.address.street}
          <br />
          {order.address.city}, {order.address.state} {order.address.postalCode}
          <br />
          {order.address.country}
        </p>
      </div>

      {/* ── PAYMENT INFO ──────────────────────────────────── */}
      {order.payment && (
        <div className="mb-4 rounded-lg border bg-white p-5">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
            <CreditCard className="h-4 w-4" />
            Payment
          </h2>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span
              className={`font-medium ${
                order.payment.status === 'SUCCEEDED' ? 'text-green-600' : 'text-gray-600'
              }`}
            >
              {order.payment.status}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-gray-500">Amount Charged</span>
            <span className="font-medium text-gray-900">
              ${Number(order.payment.amount).toFixed(2)} {order.payment.currency.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* ── NOTES ─────────────────────────────────────────── */}
      {order.notes && (
        <div className="mb-4 rounded-lg border bg-white p-5">
          <h2 className="mb-2 text-base font-semibold text-gray-900">Notes</h2>
          <p className="text-sm text-gray-600">{order.notes}</p>
        </div>
      )}

      {/* ── ACTIONS ───────────────────────────────────────── */}
      <div className="flex gap-3">
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="rounded-md border border-red-300 px-6 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}

        {order.status === 'DELIVERED' && (
          <Link
            href={`/products`}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Buy Again
          </Link>
        )}
        {order.status === 'DELIVERED' && !order.returnRequest && (
          <button
            onClick={() => setShowReturnModal(true)}
            className="rounded-md border border-orange-300 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50"
          >
            Request Return
          </button>
        )}
        <button
          onClick={handleDownloadInvoice}
          disabled={downloading}
          className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {downloading ? 'Generating PDF...' : 'Download Invoice'}
        </button>
      </div>
      {order.returnRequest && (
        <div className="rounded-lg border bg-orange-50 p-4">
          <p className="text-sm font-medium text-orange-700">
            Return Request: {order.returnRequest.status}
          </p>
          {order.returnRequest.adminNote && (
            <p className="mt-1 text-xs text-orange-600">Note: {order.returnRequest.adminNote}</p>
          )}
        </div>
      )}

      {showReturnModal && (
        <ReturnModal
          orderId={orderId}
          onClose={() => setShowReturnModal(false)}
          onSubmitted={() => {
            setShowReturnModal(false);
            fetchOrder();
          }}
        />
      )}
    </div>
  );
}

function ReturnModal({
  orderId,
  onClose,
  onSubmitted,
}: {
  orderId: number;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const REASONS = [
    { value: 'DAMAGED', label: 'Item arrived damaged' },
    { value: 'WRONG_ITEM', label: 'Received wrong item' },
    { value: 'NOT_AS_DESCRIBED', label: 'Not as described' },
    { value: 'CHANGED_MIND', label: 'Changed my mind' },
    { value: 'OTHER', label: 'Other' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/returns/order/${orderId}`, { reason, details });
      toast.success('Return request submitted');
      onSubmitted();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Request Return</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a reason...</option>
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Additional Details (optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="Please describe the issue..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-orange-500 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Return Request'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
