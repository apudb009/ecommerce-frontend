import { Banner } from '@/lib/types';
import { serverFetch } from '@/lib/server-api';
import BannerClient from '@/components/admin/banner/BannerClient';

export default async function AdminBannersPage() {
  const banners = await serverFetch<Banner[]>('/banners/admin/all');

  return <BannerClient banners={banners} />;
}
