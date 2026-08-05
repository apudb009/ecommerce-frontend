'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // wait for auth to settle
    const timer = setTimeout(() => {
      if (!user) {
        router.replace('/admin/login');
        return;
      }
      if (user.role === 'CUSTOMER') {
        router.replace('/products');
        return;
      }
      setChecked(true);
    }, 300);

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
