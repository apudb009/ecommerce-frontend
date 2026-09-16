import { Wishlist } from '@/lib/types';
import { serverFetch } from '@/lib/server-api';
import WishlistClient from '@/components/shop/wishlist/WishlistClient';

export default async function WishlistPage() {
  const wishlist = await serverFetch<Wishlist>('/wishlist');

  return <WishlistClient wishlist={wishlist} />;
}
