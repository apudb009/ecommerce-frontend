import { Coupon, PaginatedResponse, User, UserPermission } from '@/lib/types';
import { serverFetch } from '@/lib/server-api';
import CouponClient from '@/components/admin/coupon/CouponClient';

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function AdminCouponsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = params.page ?? '1';
  const limit = params.limit ?? '10';
  const search = params.search;
  const sortBy = params.sort ?? 'createdAt';
  const sortOrder = params.order ?? 'desc';
  const query = new URLSearchParams(
    Object.entries({ page, limit, search, sortBy, sortOrder }).filter(
      ([, value]) => value !== undefined,
    ) as [string, string][],
  ).toString();
  const queryKey = `${page}|${limit}|${search ?? ''}|${sortBy}|${sortOrder}|{}`;

  const [user, coupons] = await Promise.all([
    serverFetch<User>('/user/me', { revalidate: 0 }),
    serverFetch<PaginatedResponse<Coupon>>(`/coupons?${query}`, {
      revalidate: 0,
    }),
  ]);

  const permissions: UserPermission[] =
    user.userRole?.permissions?.map((entry) => ({
      module: entry.permission.module,
      action: entry.permission.action,
    })) ?? [];

  return (
    <CouponClient
      initialData={coupons.data}
      initialMeta={coupons.meta}
      initialQueryKey={queryKey}
      permissions={permissions}
    />
  );
}
