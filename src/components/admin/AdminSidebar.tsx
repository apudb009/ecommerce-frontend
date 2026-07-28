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
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Banners', href: '/admin/banners', icon: Image },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Coupons', href: '/admin/coupons', icon: Tag },
  { label: 'Invoices', href: '/admin/invoices', icon: FileText },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Newsletters', href: '/admin/newsletters', icon: Mail },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Taxes', href: '/admin/taxes', icon: Percent },
  { label: 'Shipping', href: '/admin/shipping', icon: Truck },
  { label: 'Returns', href: '/admin/returns', icon: RotateCcw },
  { label: 'Scheduler', href: '/admin/scheduler', icon: Clock },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Flash Sales', href: '/admin/flash-sales', icon: Zap },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white md:block">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="font-bold text-gray-900">Admin Panel</h1>
      </div>

      <nav className="space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
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
