import type { Metadata } from 'next';
import FlashSalesClient from '@/components/admin/flash-sales/FlashSalesClient';
export const metadata: Metadata = {
  title: 'Flash Sales',
  robots: { index: false, follow: false },
};

export default function FlashSalesPage() {
  return <FlashSalesClient />;
}
