'use client';

import { useRouter } from 'next/navigation';
import { Cart, Shipping, Tax } from '@/lib/types';
import { Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function CartSummary({ cart }: { cart: Cart }) {
  const router = useRouter();
  const [tax, setTax] = useState<Tax>();
  const [shipping, setShipping] = useState<Shipping>();

  useEffect(() => {
    const getTaxAndShipping = async () => {
      const [taxRes, shippingRes] = await Promise.all([
        api.get('taxes/active'),
        api.get('shipping/active'),
      ]);
      setTax(taxRes.data);
      setShipping(shippingRes.data);
    };
    getTaxAndShipping();
  }, []);

  const shippingAmount = Number(shipping?.price ?? 0);
  const taxAmount =
    tax?.type === 'FIXED' ? tax.rate : cart.totalAmount * (Number(tax?.rate ?? 0) / 100); // 8% estimated tax
  const total = cart.totalAmount + shippingAmount + taxAmount;
  const totalSavings = cart.totalSavings || 0;

  return (
    <div className="sticky top-20 rounded-lg border bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({cart.totalItems} items)</span>
          <span>${cart.totalAmount.toFixed(2)}</span>
        </div>
        {/* ← flash savings row */}
        {totalSavings > 0 && (
          <div className="flex justify-between font-medium text-red-600">
            <span className="flex items-center gap-1">🔥 Flash Sale Savings</span>
            <span>-${totalSavings.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>{shippingAmount === 0 ? 'Free' : `$${shippingAmount.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Estimated Tax</span>
          <span>${taxAmount.toFixed(2)}</span>
        </div>
      </div>

      {cart.totalAmount < 50 && (
        <p className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-700">
          Add ${(50 - cart.totalAmount).toFixed(2)} more for free shipping!
        </p>
      )}

      <div className="mt-4 flex justify-between border-t pt-4 text-base font-bold text-gray-900">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      <button
        onClick={() => router.push('/checkout')}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
      >
        <Lock className="h-4 w-4" />
        Proceed to Checkout
      </button>

      <p className="mt-3 text-center text-xs text-gray-400">Secure checkout powered by Stripe</p>
    </div>
  );
}
