import { Order, Tracking, User, UserPermission } from '@/lib/types';
import { serverFetch } from '@/lib/server-api';
import OrderDetailsClient from '@/components/admin/orders/OrderDetailsClient';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const [user, order, tracking] = await Promise.all([
    serverFetch<User>('/user/me'),
    serverFetch<Order>('/orders/admin/' + id),
    serverFetch<Tracking>('/orders/admin/' + id + '/tracking'),
  ]);

  const permissions: UserPermission[] =
    user.userRole?.permissions?.map((entry) => ({
      module: entry.permission.module,
      action: entry.permission.action,
    })) ?? [];

  return <OrderDetailsClient order={order} tracking={tracking} permissions={permissions} />;
}
