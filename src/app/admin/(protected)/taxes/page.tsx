import { Tax, User, UserPermission } from '@/lib/types';
import { serverFetch } from '@/lib/server-api';
import TaxClient from '@/components/admin/taxes/TaxClient';

export default async function AdminTaxesPage() {
  const [user, taxes] = await Promise.all([
    serverFetch<User>('/user/me', { revalidate: 0 }),
    serverFetch<Tax[]>('/taxes'),
  ]);

  const permissions: UserPermission[] =
    user.userRole?.permissions?.map((entry) => ({
      module: entry.permission.module,
      action: entry.permission.action,
    })) ?? [];

  return <TaxClient taxes={taxes} permissions={permissions} />;
}
