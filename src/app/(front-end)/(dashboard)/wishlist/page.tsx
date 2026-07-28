'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Product } from '@/lib/types';
import { toast } from 'sonner';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function WishlistPage() {
  const { fetchCart } = useCartStore();
  const [items, setItems] = useState<{ id: number; product: Product }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data } = await api.get('/wishlist');
        setItems(data.items || []);
      } catch {
        toast.error('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };

    void fetchWishlist();
  }, []);

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
      await api.post('/cart/items', { productId: product.id, quantity: 1 });
      await api.delete(`/wishlist/${product.id}`);
      await fetchCart();
      setItems((prev) => prev.filter((i) => i.product.id !== product.id));
      toast.success(`${product.name} moved to cart`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to move to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ product }) => (
            <div
              key={product.id}
              className="flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm"
            >
              <Link href={`/products/${product.slug}`}>
                <div className="aspect-square bg-gray-100">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="h-full w-full object-cover"
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
                  ${Number(product.price).toFixed(2)}
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
