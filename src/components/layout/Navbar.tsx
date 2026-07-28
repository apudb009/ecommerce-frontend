'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  LogOut,
  Package,
  ChevronDown,
  FileText,
  Heart,
} from 'lucide-react';
import api from '@/lib/api';
import type { Category } from '@/lib/types';
import NotificationBell from './NotificationBell';
import { useSettingsStore } from '@/store/settingsStore';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { cart } = useCartStore();

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const { settings } = useSettingsStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState(searchQuery);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);

  // ── fetch categories for nav ───────────────────────
  useEffect(() => {
    api
      .get('/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
      setMenuOpen(false);
    } else {
      router.push('/products');
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push('/home');
  };

  const cartCount = cart?.totalItems || 0;

  return (
    <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* ── LOGO ──────────────────────────────────── */}
          <Link href="/" className="shrink-0 flex items-center gap-2">
            {settings.store_logo ? (
              <img
                src={settings.store_logo as string}
                alt={settings.store_name as string}
                className="h-8 w-auto"
              />
            ) : (
              <span className="text-xl font-bold text-blue-600">
                🛒 {(settings.store_name as string) || 'ShopApp'}
              </span>
            )}
          </Link>

          {/* ── SEARCH (desktop) ──────────────────────── */}
          <form onSubmit={handleSearch} className="hidden flex-1 items-center gap-2 md:flex">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Search
            </button>
          </form>

          {/* ── DESKTOP NAV ───────────────────────────── */}
          <div className="hidden items-center gap-4 md:flex">
            {/* categories dropdown */}
            <div className="relative">
              <button
                onClick={() => setCatMenuOpen((s) => !s)}
                className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Categories
                <ChevronDown className="h-4 w-4" />
              </button>

              {catMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setCatMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-48 rounded-md border bg-white py-1 shadow-lg">
                    <Link
                      href="/products"
                      onClick={() => setCatMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      All Products
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/categories/${cat.slug}`}
                        onClick={() => setCatMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {cat.name}
                        {cat._count && (
                          <span className="ml-1 text-xs text-gray-400">
                            ({cat._count.products})
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
            <NotificationBell />
            {/* cart */}
            <Link href="/cart" className="relative text-gray-700 hover:text-blue-600">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            {/* user menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((s) => !s)}
                  className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  <User className="h-4 w-4" />
                  {user.name || user.username}
                  <ChevronDown className="h-3 w-3" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-48 rounded-md border bg-white py-1 shadow-lg">
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Heart className="h-4 w-4" />
                        Wishlist
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Package className="h-4 w-4" />
                        My Orders
                      </Link>
                      <Link
                        href="/invoices"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FileText className="h-4 w-4" />
                        My Invoices
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* ── MOBILE BUTTONS ────────────────────────── */}
          <div className="flex items-center gap-3 md:hidden">
            <Link href="/cart" className="relative text-gray-700">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen((s) => !s)} className="text-gray-700">
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* ── MOBILE MENU ───────────────────────────────── */}
        {menuOpen && (
          <div className="border-t pb-4 md:hidden">
            {/* mobile search */}
            <form onSubmit={handleSearch} className="flex gap-2 pt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
              >
                Go
              </button>
            </form>

            {/* mobile links */}
            <div className="mt-4 space-y-1">
              <Link
                href="/products"
                onClick={() => setMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                All Products
              </Link>

              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                >
                  {cat.name}
                </Link>
              ))}

              <hr className="my-2" />

              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
