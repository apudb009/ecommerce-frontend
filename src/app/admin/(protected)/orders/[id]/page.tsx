'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Order, OrderStatus, Tracking } from '@/lib/types';
import { toast } from 'sonner';
import { ArrowLeft, Truck } from 'lucide-react';
import OrderTimeline from '@/components/order/OrderTimeline';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/helpers/checkPermission';

const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'REFUNDED'],
  PROCESSING: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  PAID: 'bg-blue-500',
  PROCESSING: 'bg-purple-500',
  SHIPPED: 'bg-indigo-500',
  DELIVERED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
  REFUNDED: 'bg-gray-500',
};

export default function AdminOrderDetailPage() {
  const { permissions } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<Tracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [showTrackingForm, setShowTrackingForm] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const [orderRes, trackingRes] = await Promise.all([
        api.get(`/orders/admin/${orderId}`),
        api.get(`/orders/admin/${orderId}/tracking`),
      ]);

      setOrder(orderRes.data);
      setTracking(trackingRes.data);
      setTrackingNumber(trackingRes.data.trackingNumber || '');
    } catch {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        await fetchOrder();

        if (cancelled) return;
      } catch {
        if (!cancelled) {
          toast.error('Failed to load order');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [fetchOrder]);

  const handleStatusUpdate = async (status: OrderStatus) => {
    if (!confirm(`Change order status to ${status}?`)) return;

    setUpdating(true);
    try {
      const { data } = await api.patch(`/orders/${orderId}/status`, {
        status,
        location: customLocation ?? undefined,
        trackingMessage: customMessage ?? undefined,
      });
      setCustomMessage('');
      setCustomLocation('');
      setShowTrackingForm(false);
      setOrder(data);
      fetchOrder();
      toast.success(`Order updated to ${status}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveTrackingNumber = async () => {
    try {
      await api.patch(`/orders/${orderId}/tracking-number`, { trackingNumber });
      toast.success('Tracking number saved');
    } catch {
      toast.error('Failed to save tracking number');
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

  const nextStatuses = STATUS_FLOW[order.status];

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => router.push('/admin/orders')}
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        All Orders
      </button>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium text-white ${STATUS_COLORS[order.status]}`}
        >
          {order.status}
        </span>
      </div>

      {/* ── TRACKING TIMELINE ──────────────────────────── */}
      {tracking && (
        <OrderTimeline timeline={tracking.timeline} trackingNumber={tracking.trackingNumber} />
      )}

      {/* status actions */}
      {nextStatuses.length > 0 && hasPermission(permissions, 'orders', 'update') && (
        <div className="mb-6 rounded-lg border bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Update Status</h3>
          {/* optional custom tracking message */}

          <button
            onClick={() => setShowTrackingForm((s) => !s)}
            className="mb-3 text-xs text-blue-600 hover:underline"
          >
            {showTrackingForm ? 'Hide' : '+ Add custom tracking message'}
          </button>

          {showTrackingForm && (
            <div className="mb-3 space-y-2 rounded-md bg-gray-50 p-3">
              <input
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Custom message (optional)"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="Location (e.g. Berlin Warehouse)"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={updating}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {updating ? 'Updating...' : `Mark as ${status}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── TRACKING NUMBER ────────────────────────────── */}
      {hasPermission(permissions, 'orders', 'update') && (
        <div className="rounded-lg border bg-white p-5">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
            <Truck className="h-4 w-4" />
            Carrier Tracking Number
          </h2>
          <div className="flex gap-2">
            <input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. DHL1234567890"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSaveTrackingNumber}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Visible to customer on their order tracking page
          </p>
        </div>
      )}

      {/* items */}
      <div className="mb-6 rounded-lg border bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Items</h3>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.productName} × {item.quantity}
              </span>
              <span className="font-medium text-gray-900">${Number(item.total).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
          <span>Total</span>
          <span>${Number(order.totalAmount).toFixed(2)}</span>
        </div>
      </div>

      {/* address */}
      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Delivery Address</h3>
        <p className="text-sm text-gray-600">
          {order.address.street}
          <br />
          {order.address.city}, {order.address.postalCode}
          <br />
          {order.address.country}
        </p>
      </div>
    </div>
  );
}
