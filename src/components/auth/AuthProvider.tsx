'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useSettingsStore } from '@/store/settingsStore';
import api, { getToken, refreshTokens } from '@/lib/api';

// ── only these routes require login ───────────────
const PROTECTED_ROUTES = ['/cart', '/checkout', '/orders', '/profile'];

// ── redirect away if already logged in ────────────
const AUTH_ONLY_ROUTES = ['/login', '/register', '/admin/login'];
const AUTH_ENTRY_ROUTES = ['/login', '/admin/login'];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, logout } = useAuthStore();
  const { fetchCart, hasLoaded: cartLoaded } = useCartStore();

  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);

  const { fetchSettings, isMaitenanceMode, loading: settingsLoading } = useSettingsStore();

  useEffect(() => {
    if (AUTH_ENTRY_ROUTES.includes(pathname) || !getToken()) return;

    const refreshSession = () => {
      void refreshTokens().catch(() => {
        logout();
        router.replace(pathname.startsWith('/admin') ? '/admin/login' : '/login');
      });
    };

    const interval = window.setInterval(refreshSession, 10 * 60 * 1000); // refresh token every 10 minutes
    return () => window.clearInterval(interval);
  }, [logout, pathname, router]);

  useEffect(() => {
    if (AUTH_ENTRY_ROUTES.includes(pathname) || pathname.startsWith('/admin')) return;
    void fetchSettings();
  }, [fetchSettings, pathname]);

  useEffect(() => {
    const init = async () => {
      if (AUTH_ENTRY_ROUTES.includes(pathname)) {
        setLoading(false);
        return;
      }

      if (settingsLoading && !pathname.startsWith('/admin')) {
        return;
      }

      const token = getToken();

      const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));

      const isAuthOnly = AUTH_ONLY_ROUTES.includes(pathname);

      if (!pathname.startsWith('/admin') && pathname !== '/maintenance' && isMaitenanceMode) {
        router.replace('/maintenance');
        return;
      }

      if (pathname === '/maintenance') {
        setLoading(false);
        return;
      }

      const redirectAdmin = (role: string) => {
        if (role !== 'CUSTOMER' && !pathname.startsWith('/admin')) {
          router.replace('/admin/dashboard');
          return true;
        }

        return false;
      };

      // ─────────────────────────────────────────────
      // No token
      // ─────────────────────────────────────────────
      if (!token) {
        logout();

        if (isProtected) {
          router.replace(`/login?redirect=${pathname}`);
        }

        setLoading(false);
        return;
      }

      // ─────────────────────────────────────────────
      // User already exists in Zustand
      // ─────────────────────────────────────────────
      if (user) {
        const shouldHydrateCart =
          !cartLoaded &&
          !pathname.startsWith('/admin') &&
          !pathname.startsWith('/cart') &&
          !pathname.startsWith('/checkout');

        if (shouldHydrateCart) {
          await fetchCart();
        }

        if (redirectAdmin(user.role)) {
          setLoading(false);
          return;
        }

        if (isAuthOnly) {
          router.replace(user.role !== 'CUSTOMER' ? '/admin/dashboard' : '/home');
          setLoading(false);
          return;
        }

        setLoading(false);
        return;
      }

      // ─────────────────────────────────────────────
      // Fetch user (page refresh)
      // ─────────────────────────────────────────────
      try {
        const shouldFetchCart =
          !pathname.startsWith('/admin') &&
          !pathname.startsWith('/cart') &&
          !pathname.startsWith('/checkout');
        const [userResponse] = await Promise.all([
          api.get('/user/me'),
          shouldFetchCart ? fetchCart() : Promise.resolve(),
        ]);
        const { data } = userResponse;

        setUser(data);

        if (redirectAdmin(data.role)) {
          setLoading(false);
          return;
        }

        if (isAuthOnly) {
          router.replace(data.role !== 'CUSTOMER' ? '/admin/dashboard' : '/home');
          setLoading(false);
          return;
        }
      } catch {
        logout();

        if (isProtected) {
          router.replace(`/login?redirect=${pathname}`);
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [
    pathname,
    router,
    user,
    cartLoaded,
    setUser,
    logout,
    fetchCart,
    isMaitenanceMode,
    settingsLoading,
  ]);

  const isAuthOnly = AUTH_ONLY_ROUTES.includes(pathname);

  useEffect(() => {
    if (
      !settingsLoading &&
      isMaitenanceMode &&
      !pathname.startsWith('/admin') &&
      pathname !== '/maintenance'
    ) {
      router.replace('/maintenance');
    }
  }, [settingsLoading, isMaitenanceMode, pathname, router]);

  if (loading && isAuthOnly && !AUTH_ENTRY_ROUTES.includes(pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
