'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useSettingsStore } from '@/store/settingsStore';
import api, { getToken } from '@/lib/api';

// ── only these routes require login ───────────────
const PROTECTED_ROUTES = ['/cart', '/checkout', '/orders', '/profile'];

// ── redirect away if already logged in ────────────
const AUTH_ONLY_ROUTES = ['/login', '/register', '/maintenance', '/admin/login'];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, logout } = useAuthStore();
  const { fetchCart } = useCartStore();

  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);

  const { fetchSettings, isMaitenanceMode, loading: settingsLoading } = useSettingsStore();

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    const init = async () => {
      if (settingsLoading) {
        return;
      }

      const token = getToken();

      const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));

      const isAuthOnly = AUTH_ONLY_ROUTES.includes(pathname);

      if (!pathname.startsWith('/admin') && pathname !== '/maintenance' && isMaitenanceMode) {
        router.replace('/maintenance');
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
        const { data } = await api.get('/user/me');

        setUser(data);

        await fetchCart();

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
  }, [pathname, router, user, setUser, logout, fetchCart, isMaitenanceMode, settingsLoading]);

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthOnly = AUTH_ONLY_ROUTES.includes(pathname);
  const shouldWaitForMaintenanceCheck =
    settingsLoading && !pathname.startsWith('/admin') && pathname !== '/maintenance';

  if ((loading && (isProtected || isAuthOnly)) || shouldWaitForMaintenanceCheck) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
