import {
  MostRatedProducts,
  OrderAnalitics,
  OrderStatusAnalitics,
  OverviewAnalitics,
  ProductLowStock,
  RecentOrder,
  RevenuAnalitics,
  TopCategories,
  TopProducts,
  UsersAnalitics,
} from '@/lib/types';

import { serverFetch } from '@/lib/server-api';
import DashboardClient from '@/components/admin/dashboard/DashboardClient';

export default async function AdminDashboardPage() {
  const [
    overviewRes,
    revenueRes,
    ordersRes,
    statusRes,
    topRes,
    catRes,
    usersRes,
    lowStockRes,
    recentRes,
    ratedProductsRes,
  ] = await Promise.all([
    serverFetch<OverviewAnalitics>('/analytics/overview'),
    serverFetch<RevenuAnalitics[]>('/analytics/revenue-by-day'),
    serverFetch<OrderAnalitics[]>('/analytics/orders-by-day'),
    serverFetch<OrderStatusAnalitics[]>('/analytics/orders-by-status'),
    serverFetch<TopProducts[]>('/analytics/top-products'),
    serverFetch<TopCategories[]>('/analytics/revenue-by-category'),
    serverFetch<UsersAnalitics[]>('/analytics/new-users-by-week'),
    serverFetch<ProductLowStock[]>('/analytics/low-stock'),
    serverFetch<RecentOrder[]>('/analytics/recent-orders'),
    serverFetch<MostRatedProducts[]>('/analytics/most-rated'),
  ]);

  return (
    <DashboardClient
      overview={overviewRes}
      revenueData={revenueRes}
      ordersData={ordersRes}
      statusData={statusRes}
      topProducts={topRes}
      catData={catRes}
      usersData={usersRes}
      lowStock={lowStockRes}
      recentOrders={recentRes}
      ratedProducts={ratedProductsRes}
    />
  );
}
