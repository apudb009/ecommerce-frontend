import type { Metadata } from 'next';
import { baseMetadata } from '@/lib/seo';
import './globals.css';
import AuthProvider from '@/components/auth/AuthProvider';
import { Toaster } from 'sonner';
import SettingsProvider from '@/components/settings/SettingsProvider';
import { SettingStore } from '@/lib/types';
import { serverFetch } from '@/lib/server-api';

export const metadata: Metadata = baseMetadata;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let settings: Partial<SettingStore> = {};

  try {
    settings = await serverFetch<Partial<SettingStore>>('/settings', { revalidate: 30 });
  } catch {
    // Keep the shell renderable if the settings API is unavailable.
  }

  return (
    <html lang="en">
      <body className="antialiased">
        <SettingsProvider initialSettings={settings}>
          <AuthProvider>{children}</AuthProvider>
        </SettingsProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
