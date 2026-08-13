/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Order, OrderStatus } from '@/lib/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import OrderTimeline from '@/components/order/OrderTimeline';
import { ArrowLeft, Package, MapPin } from 'lucide-react';
import ProgressTracker from './ProgressTracker';
import CancelledBanner from './CancelledBanner';
import OrderItem from './OrderItem';
import PaymentInfo from './PaymentInfo';
import Actions from './Actions';
import ReturnModal from './Modal/ReturnModal';

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  PAID: 'bg-blue-100 text-blue-700 border-blue-200',
  PROCESSING: 'bg-purple-100 text-purple-700 border-purple-200',
  SHIPPED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  REFUNDED: 'bg-gray-100 text-gray-700 border-gray-200',
};

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
      {!isCancelled && <ProgressTracker currentStep={currentStep} />}

      {/* ── CANCELLED BANNER ──────────────────────────────── */}
      {isCancelled && <CancelledBanner order={order} />}

      {/* ── ORDER ITEMS ───────────────────────────────────── */}
      <div className="mb-4 rounded-lg border bg-white p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
          <Package className="h-4 w-4" />
          Items Ordered
        </h2>

        <div className="space-y-3">
          {order.items.map((item) => (
            <OrderItem key={item.id} item={item} />
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
      {order.payment && <PaymentInfo payment={order.payment} />}

      {/* ── NOTES ─────────────────────────────────────────── */}
      {order.notes && (
        <div className="mb-4 rounded-lg border bg-white p-5">
          <h2 className="mb-2 text-base font-semibold text-gray-900">Notes</h2>
          <p className="text-sm text-gray-600">{order.notes}</p>
        </div>
      )}

      {/* ── ACTIONS ───────────────────────────────────────── */}
      <Actions
        canCancel={canCancel}
        cancelling={cancelling}
        order={order}
        downloading={downloading}
        onReturnRequestClick={() => setShowReturnModal(true)}
        handleDownloadInvoice={handleDownloadInvoice}
        handleCancel={handleCancel}
      />
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
