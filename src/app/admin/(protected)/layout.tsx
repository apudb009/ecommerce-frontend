import AdminSidebar from '@/components/admin/AdminSidebar';
import { redirect } from 'next/navigation';
import { serverFetch } from '@/lib/server-api';
import { User, UserPermission } from '@/lib/types';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  let permissions: UserPermission[] = [];
  try {
    const user = await serverFetch<User>('/user/me', { revalidate: 0 });
    permissions =
      user.userRole?.permissions?.map((entry) => ({
        module: entry.permission.module,
        action: entry.permission.action,
      })) ?? [];

    if (user.role === 'CUSTOMER') {
      redirect('/products');
    }
  } catch {
    redirect('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar permissions={permissions} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
