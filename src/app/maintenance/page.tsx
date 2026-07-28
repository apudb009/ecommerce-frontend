import { SettingStore } from '@/lib/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Under Maintenance',
  robots: { index: false, follow: false },
};

async function getMaintenanceMode(): Promise<{
  //maintenance_mode: boolean;
  store_name: string;
  store_email: string;
} | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
      next: { revalidate: 30 },
    });
    const data = (await res.json()) as Partial<SettingStore>;
    const storeName = data.store_name as string;
    const storeEmail = data.store_email as string;
    return {
      //maintenance_mode: data.maintenance_mode as unknown as boolean,
      store_name: storeName,
      store_email: storeEmail,
    };
  } catch {
    return null;
  }
}

export default async function MaintenancePage() {
  const maintenanceInfo = await getMaintenanceMode();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 px-4 text-white">
      {/* animated gears background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-5">
        <div className="absolute -left-20 -top-20 h-96 w-96 animate-spin-slow rounded-full border-8 border-white" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 animate-spin-slow-reverse rounded-full border-8 border-white" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-spin-slow rounded-full border-4 border-white" />
      </div>

      <div className="relative z-10 max-w-xl text-center">
        {/* icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <svg
              className="h-24 w-24 animate-pulse text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {/* spinning ring around icon */}
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-dashed border-blue-400/40" />
          </div>
        </div>

        {/* store name */}
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-blue-400">
          🛒 {maintenanceInfo?.store_name}
        </p>

        {/* heading */}
        <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">We&apos;ll Be Back Soon!</h1>

        {/* description */}
        <p className="mb-8 text-lg leading-relaxed text-gray-400">
          We&apos;re currently performing scheduled maintenance to improve your shopping experience.
          We apologize for the inconvenience.
        </p>

        {/* status card */}
        <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-yellow-400" />
            </span>
            Maintenance in progress
          </div>

          {/* progress bar */}
          <div className="mt-4 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-1.5 animate-pulse rounded-full bg-linear-to-r from-blue-500 to-blue-400"
              style={{ width: '65%' }}
            />
          </div>
        </div>

        {/* contact */}
        <p className="text-sm text-gray-500">
          Need urgent help?{' '}
          <a
            href={`mailto:${maintenanceInfo?.store_email}`}
            className="text-blue-400 underline underline-offset-2 hover:text-blue-300"
          >
            {maintenanceInfo?.store_email}
          </a>
        </p>
      </div>
    </div>
  );
}
