'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import { toast } from 'sonner';
import { ShoppingCart, ArrowLeft, Trash2 } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { cart, isLoading, fetchCart } = useCartStore();
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    void fetchCart();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClearCart = async () => {
    if (!confirm('Remove all items from cart?')) return;

    setClearing(true);
    try {
      await api.delete('/cart');
      await fetchCart();
      toast.success('Cart cleared');
    } catch {
      toast.error('Failed to clear cart');
    } finally {
      setClearing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div>
      <button
        onClick={() => router.push('/products')}
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Continue Shopping
      </button>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">Shopping Cart</h1>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-20 text-center">
          <ShoppingCart className="mb-3 h-12 w-12 text-gray-300" />
          <h2 className="text-lg font-medium text-gray-700">Your cart is empty</h2>
          <p className="mt-1 text-sm text-gray-500">
            Looks like you haven&apos;t added anything yet
          </p>
          <Link
            href="/products"
            className="mt-4 rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* items */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border bg-white p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'}
                </span>
                <button
                  onClick={handleClearCart}
                  disabled={clearing}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear Cart
                </button>
              </div>

              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* summary */}
          <div>
            <CartSummary cart={cart} />
          </div>
        </div>
      )}
    </div>
  );
}
