import { Shipping, User, UserPermission } from '@/lib/types';
import { serverFetch } from '@/lib/server-api';
import ShippingClient from '@/components/admin/shipping/ShippingClient';

export default async function AdminShippingPage() {
  const [user, shippings] = await Promise.all([
    serverFetch<User>('/user/me'),
    serverFetch<Shipping[]>('/shippings'),
  ]);

  const permissions: UserPermission[] =
    user.userRole?.permissions?.map((entry) => ({
      module: entry.permission.module,
      action: entry.permission.action,
    })) ?? [];

  return <ShippingClient shippings={shippings} permissions={permissions} />;
}
