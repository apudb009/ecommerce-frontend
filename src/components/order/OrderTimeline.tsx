'use client';

import { format } from 'date-fns';
import {
  Clock,
  CreditCard,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  MapPin,
  LucideProps,
} from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

interface TrackingEvent {
  id: number | null;
  status: string;
  message: string;
  location: string | null;
  createdAt: string | null;
  isCompleted: boolean;
  isCurrent: boolean;
  isPending?: boolean;
}

const STATUS_CONFIG: Record<
  string,
  {
    icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
    label: string;
    color: string;
    bg: string;
    ring: string;
  }
> = {
  PENDING: {
    icon: Clock,
    label: 'Order Placed',
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    ring: 'ring-yellow-300',
  },
  PAID: {
    icon: CreditCard,
    label: 'Payment Confirmed',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    ring: 'ring-blue-300',
  },
  PROCESSING: {
    icon: Package,
    label: 'Processing',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    ring: 'ring-purple-300',
  },
  SHIPPED: {
    icon: Truck,
    label: 'Shipped',
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
    ring: 'ring-indigo-300',
  },
  DELIVERED: {
    icon: CheckCircle,
    label: 'Delivered',
    color: 'text-green-600',
    bg: 'bg-green-100',
    ring: 'ring-green-300',
  },
  CANCELLED: {
    icon: XCircle,
    label: 'Cancelled',
    color: 'text-red-600',
    bg: 'bg-red-100',
    ring: 'ring-red-300',
  },
  REFUNDED: {
    icon: RefreshCw,
    label: 'Refunded',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    ring: 'ring-gray-300',
  },
};

export default function OrderTimeline({
  timeline,
  trackingNumber,
}: {
  timeline: TrackingEvent[];
  trackingNumber?: string | null;
}) {
  return (
    <div className="rounded-lg border bg-white p-5 mb-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <Truck className="h-4 w-4" />
          Order Tracking
        </h2>

        {trackingNumber && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Tracking #</span>
            <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs font-medium text-gray-700">
              {trackingNumber}
            </span>
          </div>
        )}
      </div>

      <div className="relative">
        {timeline.map((event, index) => {
          const config = STATUS_CONFIG[event.status] || STATUS_CONFIG['PENDING'];
          const Icon = config.icon;
          const isLast = index === timeline.length - 1;

          return (
            <div key={`${event.status}-${index}`} className="flex gap-4">
              {/* ── ICON + LINE ──────────────────────── */}
              <div className="flex flex-col items-center">
                {/* circle icon */}
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
                    event.isCurrent
                      ? `${config.bg} ring-4 ${config.ring}`
                      : event.isCompleted
                        ? config.bg
                        : 'bg-gray-100'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      event.isCompleted || event.isCurrent ? config.color : 'text-gray-300'
                    }`}
                  />

                  {/* pulse for current step */}
                  {event.isCurrent &&
                    !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(event.status) && (
                      <span
                        className={`absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full ${
                          config.bg
                        } border-2 border-white`}
                      >
                        <span
                          className={`absolute inset-0 rounded-full ${config.bg} animate-ping opacity-75`}
                        />
                      </span>
                    )}
                </div>

                {/* vertical line */}
                {!isLast && (
                  <div
                    className={`mt-1 w-0.5 flex-1 ${
                      event.isCompleted && !event.isCurrent ? 'bg-green-300' : 'bg-gray-200'
                    }`}
                    style={{ minHeight: '2rem' }}
                  />
                )}
              </div>

              {/* ── CONTENT ──────────────────────────── */}
              <div className={`pb-6 ${isLast ? 'pb-0' : ''} flex-1`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        event.isCompleted || event.isCurrent ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {config.label}
                    </p>

                    {event.message && (event.isCompleted || event.isCurrent) && (
                      <p className="mt-0.5 text-xs text-gray-500">{event.message}</p>
                    )}

                    {/* location badge */}
                    {event.location && (event.isCompleted || event.isCurrent) && (
                      <div className="mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{event.location}</span>
                      </div>
                    )}

                    {/* pending label */}
                    {event.isPending && !event.isCompleted && (
                      <p className="mt-0.5 text-xs text-gray-300 italic">Pending</p>
                    )}
                  </div>

                  {/* timestamp */}
                  {event.createdAt && (event.isCompleted || event.isCurrent) && (
                    <span className="shrink-0 text-right text-xs text-gray-400">
                      {format(new Date(event.createdAt), 'MMM d')}
                      <br />
                      {format(new Date(event.createdAt), 'h:mm a')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
