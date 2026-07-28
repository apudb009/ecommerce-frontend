'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { CartItem as CartItemType } from '@/lib/types';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function CartItem({ item }: { item: CartItemType }) {
  const { fetchCart } = useCartStore();
  const [updating, setUpdating] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity);

  const handleUpdateQuantity = async (newQty: number) => {
    if (newQty < 1 || newQty > item.product.stock) return;

    setQuantity(newQty);
    setUpdating(true);
    try {
      await api.patch(`/cart/items/${item.product.id}`, { quantity: newQty });
      await fetchCart();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update quantity');
      setQuantity(item.quantity); // revert
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    setUpdating(true);
    try {
      await api.delete(`/cart/items/${item.product.id}`);
      await fetchCart();
      toast.success(`${item.product.name} removed from cart`);
    } catch {
      toast.error('Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex gap-4 border-b py-4 last:border-0">
      {/* image */}
      <Link
        href={`/products/${item.product.slug}`}
        className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100"
      >
        {item.product.images?.[0] ? (
          <img
            src={item.product.images[0].url}
            alt={item.product.name}
            className="h-full w-full object-cover"
          />
        ) : null}
      </Link>

      {/* details */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={`/products/${item.product.slug}`}
              className="text-sm font-medium text-gray-900 hover:text-blue-600"
            >
              {item.product.name}
            </Link>
            <p className="mt-0.5 text-xs text-gray-400">{item.product?.category?.name ?? ''}</p>
            {/* ← flash sale badge */}
            {item.isOnFlashSale && item.flashSaleName && (
              <div className="mt-1 flex items-center gap-1">
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                  🔥 {item.flashSaleName}
                </span>
                {item.flashEndTime && (
                  <span className="text-xs text-red-400">
                    ends {format(new Date(item.flashEndTime), 'h:mm a')}
                  </span>
                )}
              </div>
            )}
            {item.variant && (
              <p className="mt-0.5 text-xs text-gray-800">
                Variant: {item.variant.name}-{item.variant.value}
              </p>
            )}
          </div>
          <button
            onClick={handleRemove}
            disabled={updating}
            className="text-gray-400 hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          {/* quantity controls */}
          <div className="flex items-center rounded-md border border-gray-300">
            <button
              onClick={() => handleUpdateQuantity(quantity - 1)}
              disabled={updating || quantity <= 1}
              className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-40"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
            <button
              onClick={() => handleUpdateQuantity(quantity + 1)}
              disabled={updating || quantity >= item.product.stock}
              className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* price */}
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              ${(item.effectivePrice * quantity).toFixed(2)}
            </p>
            {item.isOnFlashSale ? (
              <p className="text-xs text-gray-400 line-through">
                ${(item.originalPrice * quantity).toFixed(2)}
              </p>
            ) : (
              <p className="text-xs text-gray-400">${item.effectivePrice.toFixed(2)} each</p>
            )}
            {/* savings */}
            {item.isOnFlashSale && item.savings > 0 && (
              <p className="text-xs font-medium text-green-600">Save ${item.savings.toFixed(2)}</p>
            )}
          </div>
        </div>

        {item.product.stock <= 5 && (
          <p className="mt-1 text-xs text-orange-600">Only {item.product.stock} left in stock</p>
        )}
      </div>
    </div>
  );
}
