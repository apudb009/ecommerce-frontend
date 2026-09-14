import { Cart } from '@/lib/types';
import { serverFetch } from '@/lib/server-api';
import CheckoutClient from '@/components/checkout/CheckoutClient';

export default async function CheckoutPage() {
  const cart = await serverFetch<Cart>('/cart');

  return <CheckoutClient cart={cart} />;
}
