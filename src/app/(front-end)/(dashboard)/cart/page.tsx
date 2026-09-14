import { serverFetch } from '@/lib/server-api';
import { Cart } from '@/lib/types';
import CartClient from '@/components/cart/CartClient';

export default async function CartPage() {
  const cart = await serverFetch<Cart>('/cart');

  return <CartClient cart={cart} />;
}
