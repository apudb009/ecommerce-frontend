import { Banner, User, UserPermission } from '@/lib/types';
import { serverFetch } from '@/lib/server-api';
import BannerClient from '@/components/admin/banner/BannerClient';

export default async function AdminBannersPage() {
  const [user, banners] = await Promise.all([
    serverFetch<User>('/user/me'),
    serverFetch<Banner[]>('/banners/admin/all'),
  ]);

  const permissions: UserPermission[] =
    user.userRole?.permissions?.map((entry) => ({
      module: entry.permission.module,
      action: entry.permission.action,
    })) ?? [];

  return <BannerClient banners={banners} permissions={permissions} />;
}
