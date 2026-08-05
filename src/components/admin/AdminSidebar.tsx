'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  LogOut,
  Image,
  FileText,
  Tag,
  Mail,
  Bell,
  Percent,
  Truck,
  RotateCcw,
  Clock,
  Settings,
  Zap,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { hasAnyPermission } from '@/helpers/checkPermission';
import { NavItem } from '@/lib/types';

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, always: true },
  { label: 'Banners', href: '/admin/banners', icon: Image, module: 'banners' },
  { label: 'Products', href: '/admin/products', icon: Package, module: 'products' },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree, module: 'categories' },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag, module: 'orders' },
  { label: 'Coupons', href: '/admin/coupons', icon: Tag, module: 'coupons' },
  { label: 'Invoices', href: '/admin/invoices', icon: FileText, module: 'invoices' },
  { label: 'Users', href: '/admin/users', icon: Users, module: 'users' },
  { label: 'Newsletters', href: '/admin/newsletters', icon: Mail, module: 'newsletters' },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell, module: 'notifications' },
  { label: 'Taxes', href: '/admin/taxes', icon: Percent, module: 'taxes' },
  { label: 'Shipping', href: '/admin/shipping', icon: Truck, module: 'shipping' },
  { label: 'Returns', href: '/admin/returns', icon: RotateCcw, module: 'returns' },
  { label: 'Scheduler', href: '/admin/scheduler', icon: Clock, module: 'scheduler' },
  { label: 'Settings', href: '/admin/settings', icon: Settings, module: 'settings' },
  { label: 'Flash Sales', href: '/admin/flash-sales', icon: Zap, module: 'flash-sales' },
  { label: 'Roles', href: '/admin/roles', icon: Shield, module: 'roles' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout, permissions } = useAuthStore();

  // ── filter nav items based on permissions ──────────
  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (item.always) return true;
    if (!item.module) return true;
    return hasAnyPermission(permissions, item.module);
  });

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white md:block">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="font-bold text-gray-900">Admin Panel</h1>
      </div>

      <nav className="space-y-1 p-3">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        <hr className="my-3" />

        <Link
          href="#"
          onClick={() => logout()}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Link>
      </nav>
    </aside>
  );
}
