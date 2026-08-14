import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Suspense } from 'react';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense
        fallback={<div className="h-16 border-b bg-white" aria-label="Loading navigation" />}
      >
        <Navbar />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
