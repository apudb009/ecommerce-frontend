import { StoreSettings, User, UserPermission } from '@/lib/types';
import { serverFetch } from '@/lib/server-api';
import SettingClient from '@/components/admin/settings/SettingClient';

export default async function AdminSettingsPage() {
  const [user, settings] = await Promise.all([
    serverFetch<User>('/user/me', { revalidate: 0 }),
    serverFetch<StoreSettings>('/settings'),
  ]);

  const permissions: UserPermission[] =
    user.userRole?.permissions?.map((entry) => ({
      module: entry.permission.module,
      action: entry.permission.action,
    })) ?? [];

  return <SettingClient settings={settings} permissions={permissions} />;
}
