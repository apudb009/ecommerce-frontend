import { SettingStore } from '@/lib/types';
import { redirect } from 'next/navigation';

async function getMaintenanceMode(): Promise<{
  maintenance_mode: boolean;
} | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
      next: { revalidate: 30 },
    });
    const data = (await res.json()) as Partial<SettingStore>;
    return {
      maintenance_mode: data.maintenance_mode as unknown as boolean,
    };
  } catch {
    return null;
  }
}

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const maintenanceInfo = await getMaintenanceMode();

  // ← redirect in Server Component layout
  if (maintenanceInfo?.maintenance_mode === true) {
    redirect('/maintenance');
  }

  return (
    <>
      {/* existing layout content */}
      {children}
    </>
  );
}
