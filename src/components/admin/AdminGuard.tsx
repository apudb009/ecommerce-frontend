'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getToken } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // wait for auth to settle before redirecting away from an admin page
    const timer = setTimeout(() => {
      const token = getToken();

      if (!token) {
        router.replace(`/admin/login?redirect=${pathname}`);
        return;
      }

      if (!user) {
        return;
      }

      if (user.role === 'CUSTOMER') {
        router.replace('/products');
        return;
      }

      setChecked(true);
    }, 10);

    return () => clearTimeout(timer);
  }, [user, router]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
