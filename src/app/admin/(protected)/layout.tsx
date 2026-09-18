import AdminSidebar from '@/components/admin/AdminSidebar';
import { redirect } from 'next/navigation';
import { serverFetch } from '@/lib/server-api';
import { User } from '@/lib/types';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  try {
    const user = await serverFetch<User>('/user/me', { revalidate: 0 });

    if (user.role === 'CUSTOMER') {
      redirect('/products');
    }
  } catch {
    redirect('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
