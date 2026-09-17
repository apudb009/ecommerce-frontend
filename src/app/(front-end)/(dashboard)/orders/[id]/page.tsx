import { Order, Tracking } from '@/lib/types';
import { serverFetch } from '@/lib/server-api';
import OrderDetailsClient from '@/components/order/OrderDetailsClient';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  const [orderRes, trackingRes] = await Promise.all([
    serverFetch<Order>(`/orders/${id}`),
    serverFetch<Tracking>(`/orders/${id}/tracking`),
  ]);

  return <OrderDetailsClient order={orderRes} tracking={trackingRes} />;
}
