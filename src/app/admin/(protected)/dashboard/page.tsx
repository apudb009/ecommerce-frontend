'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
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

const PIE_COLORS = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#dc2626', '#0891b2', '#db2777'];

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<OverviewAnalitics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenuAnalitics[]>([]);
  const [ordersData, setOrdersData] = useState<OrderAnalitics[]>([]);
  const [statusData, setStatusData] = useState<OrderStatusAnalitics[]>([]);
  const [topProducts, setTopProducts] = useState<TopProducts[]>([]);
  const [catData, setCatData] = useState<TopCategories[]>([]);
  const [usersData, setUsersData] = useState<UsersAnalitics[]>([]);
  const [lowStock, setLowStock] = useState<ProductLowStock[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [ratedProducts, setRatedProducts] = useState<MostRatedProducts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
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
          api.get('/analytics/overview'),
          api.get('/analytics/revenue-by-day'),
          api.get('/analytics/orders-by-day'),
          api.get('/analytics/orders-by-status'),
          api.get('/analytics/top-products'),
          api.get('/analytics/revenue-by-category'),
          api.get('/analytics/new-users-by-week'),
          api.get('/analytics/low-stock'),
          api.get('/analytics/recent-orders'),
          api.get('/analytics/most-rated'),
        ]);

        setOverview(overviewRes.data);
        setRevenueData(revenueRes.data);
        setOrdersData(ordersRes.data);
        setStatusData(statusRes.data);
        setTopProducts(topRes.data);
        setCatData(catRes.data);
        setUsersData(usersRes.data);
        setLowStock(lowStockRes.data);
        setRecentOrders(recentRes.data);
        setRatedProducts(ratedProductsRes.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    void fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: `$${overview?.totalRevenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
      sub: 'From delivered orders',
    },
    {
      label: 'Total Orders',
      value: overview?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      sub: `${overview?.pendingOrders || 0} pending`,
    },
    {
      label: 'Products',
      value: overview?.totalProducts || 0,
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      sub: `${overview?.lowStockProducts || 0} low stock`,
    },
    {
      label: 'Total Users',
      value: overview?.totalUsers || 0,
      icon: Users,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      sub: `${overview?.totalReviews || 0} reviews`,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* ── STAT CARDS ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-lg border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{card.sub}</p>
                </div>
                <div className={`rounded-full p-3 ${card.bg}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── REVENUE CHART ───────────────────────────── */}
      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Revenue — Last 30 Days
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => format(new Date(d), 'MMM d')}
              tick={{ fontSize: 11 }}
              interval={4}
            />
            <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, 'Revenue']}
              labelFormatter={(l) => format(new Date(l), 'MMM d, yyyy')}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── ORDERS + USERS CHARTS ───────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* orders by day */}
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Orders — Last 30 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => format(new Date(d), 'MMM d')}
                tick={{ fontSize: 10 }}
                interval={6}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip labelFormatter={(l) => format(new Date(l), 'MMM d, yyyy')} />
              <Bar dataKey="orders" fill="#2563eb" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* orders by status */}
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── TOP PRODUCTS + CATEGORY REVENUE ─────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* top products */}
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">🏆 Top Products</h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.productId} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{p.productName}</p>
                  <p className="text-xs text-gray-400">{p.totalSold} sold</p>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  ${p.revenue.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* top rated products */}
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">🌟 Most Rated Products</h2>
          <div className="space-y-3">
            {ratedProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{p.name}</p>
                </div>
                <span className="text-sm font-semibold text-green-600">{p.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* revenue by category */}
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Revenue by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={catData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
              <Tooltip formatter={(v) => [`$${Number(v ?? 0).toFixed(2)}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#7c3aed" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── NEW USERS + LOW STOCK ───────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* new users by week */}
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">New Users — Last 8 Weeks</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={usersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="users" fill="#16a34a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* low stock alert */}
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Low Stock Alert
          </h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-gray-400">All products are well stocked ✅</p>
          ) : (
            <div className="space-y-2">
              {lowStock.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}/edit`}
                  className="flex items-center justify-between rounded-md p-2 hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.category.name}</p>
                  </div>
                  <span
                    className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RECENT ORDERS ───────────────────────────── */}
      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">
            View All
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gray-500">
            <tr>
              <th className="pb-2">Order</th>
              <th className="pb-2">Customer</th>
              <th className="pb-2">Item</th>
              <th className="pb-2">Status</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="py-2 font-medium text-blue-600">
                  <Link href={`/admin/orders/${order.id}`}>#{order.id}</Link>
                </td>
                <td className="py-2 text-gray-600">{order.user?.name || order.user?.username}</td>
                <td className="py-2 text-gray-500 truncate max-w-37.5">
                  {order.items[0]?.productName}
                  {order.items.length > 1 && ` +${order.items.length - 1}`}
                </td>
                <td className="py-2">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {order.status}
                  </span>
                </td>
                <td className="py-2 text-right font-medium text-gray-900">
                  ${Number(order.totalAmount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
