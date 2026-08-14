import type { Metadata } from 'next';
import { baseMetadata } from '@/lib/seo';
import './globals.css';
import AuthProvider from '@/components/auth/AuthProvider';
import { Toaster } from 'sonner';

export const metadata: Metadata = baseMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
