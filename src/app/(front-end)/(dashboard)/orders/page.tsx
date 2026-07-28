'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Order, OrderStatus, PaginatedResponse } from '@/lib/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Package, ChevronRight } from 'lucide-react';

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
};

const STATUS_STEPS: OrderStatus[] = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<PaginatedResponse<Order>>('/orders/me', {
          params: { limit: 20, status: statusFilter || undefined },
        });
        setOrders(data.data);
      } catch {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders();
  }, [statusFilter]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Orders</h1>

      {/* ── STATUS FILTER TABS ───────────────────────── */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {(['', ...STATUS_STEPS, 'CANCELLED', 'REFUNDED'] as (OrderStatus | '')[]).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-20 text-center">
          <Package className="mb-3 h-12 w-12 text-gray-300" />
          <h2 className="text-lg font-medium text-gray-700">No orders yet</h2>
          <p className="mt-1 text-sm text-gray-500">
            {statusFilter
              ? `No ${statusFilter.toLowerCase()} orders found`
              : "You haven't placed any orders yet"}
          </p>
          <Link
            href="/products"
            className="mt-4 rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              {/* icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100">
                <Package className="h-6 w-6 text-gray-400" />
              </div>

              {/* details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">Order #{order.id}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}
                  >
                    {order.status}
                  </span>
                </div>

                <p className="mt-0.5 text-xs text-gray-400">
                  {format(new Date(order.createdAt), 'MMM d, yyyy · h:mm a')}
                </p>

                <p className="mt-1 text-xs text-gray-500 truncate">
                  {order.items.map((i) => i.productName).join(', ')}
                </p>
              </div>

              {/* price + arrow */}
              <div className="shrink-0 text-right">
                <p className="font-semibold text-gray-900">
                  ${Number(order.grandTotalAmount).toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </p>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
