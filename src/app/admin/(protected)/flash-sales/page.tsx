import type { Metadata } from 'next';
import FlashSalesClient from '@/components/admin/flash-sales/FlashSalesClient';
import { serverFetch } from '@/lib/server-api';
import { FlashSale, User, UserPermission } from '@/lib/types';
export const metadata: Metadata = {
  title: 'Flash Sales',
  robots: { index: false, follow: false },
};

export default async function FlashSalesPage() {
  const [user, flashSales] = await Promise.all([
    serverFetch<User>('/user/me', { revalidate: 0 }),
    serverFetch<FlashSale[]>('/flash-sales', { revalidate: 0 }),
  ]);

  const permissions: UserPermission[] =
    user.userRole?.permissions?.map((entry) => ({
      module: entry.permission.module,
      action: entry.permission.action,
    })) ?? [];

  return <FlashSalesClient permissions={permissions} sales={flashSales} />;
}
