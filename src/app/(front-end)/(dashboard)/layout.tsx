import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Suspense } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense
        fallback={<div className="h-16 border-b bg-white" aria-label="Loading navigation" />}
      >
        <Navbar />
      </Suspense>
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
