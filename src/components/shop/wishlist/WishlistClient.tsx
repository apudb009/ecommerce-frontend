'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Product, Wishlist, WishlistItem } from '@/lib/types';
import { toast } from 'sonner';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import { useSettingsStore } from '@/store/settingsStore';

type Props = {
  wishlist: Wishlist;
};

export default function WishlistClient({ wishlist }: Props) {
  const router = useRouter();
  const {
    settings: { currency_symbol: currencySymbol },
  } = useSettingsStore();
  const { updateCart } = useCartStore();
  const [items, setItems] = useState<WishlistItem[]>(wishlist.items ?? []);

  const handleRemove = async (productId: number) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const handleMoveToCart = async (product: Product) => {
    try {
      const hasVariant = product.variants?.length > 0;
      await api.delete(`/wishlist/${product.id}`);
      setItems((prev) => prev.filter((i) => i.product.id !== product.id));
      if (!hasVariant) {
        const { data } = await api.post('/cart/items', { productId: product.id, quantity: 1 });
        updateCart(data);
        toast.success(`${product.name} moved to cart`);
      }
      router.push(`/products/${product.slug}`);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to move to cart');
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Wishlist</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-20 text-center">
          <Heart className="mb-3 h-12 w-12 text-gray-300" />
          <h2 className="text-lg font-medium text-gray-700">Your wishlist is empty</h2>
          <p className="mt-1 text-sm text-gray-500">Save items you love for later</p>
          <Link
            href="/products"
            className="mt-4 rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {items.map(({ product }) => (
            <div
              key={product.id}
              className="flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm"
            >
              <Link href={`/products/${product.slug}`}>
                <div className="aspect-square bg-gray-100">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      className="h-full w-full object-contain"
                      width={100}
                      height={120}
                    />
                  ) : null}
                </div>
              </Link>

              <div className="flex flex-1 flex-col p-4">
                <Link href={`/products/${product.slug}`}>
                  <h3 className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-blue-600">
                    {product.name}
                  </h3>
                </Link>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  {currencySymbol}
                  {Number(product.price).toFixed(2)}
                </p>

                <div className="mt-auto flex gap-2 pt-3">
                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={product.stock === 0}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-blue-600 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="rounded-md border border-gray-300 p-2 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
