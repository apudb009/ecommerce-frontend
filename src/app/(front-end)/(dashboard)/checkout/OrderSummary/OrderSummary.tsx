import { Cart, CouponResult } from '@/lib/types';
import { ShoppingBag, Tag } from 'lucide-react';
import Image from 'next/image';
import { FC } from 'react';

type Props = {
  cart: Cart;
  subtotal: number;
  discount: number;
  couponResult: CouponResult | null;
  shipping: number;
  tax: number;
  total: number;
};
const OrderSummary: FC<Props> = ({
  cart,
  subtotal,
  discount,
  couponResult,
  shipping,
  tax,
  total,
}) => {
  return (
    <div>
      <div className="sticky top-20 rounded-lg border bg-white p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
          <ShoppingBag className="h-5 w-5" />
          Order Summary
        </h2>

        {/* items */}
        <div className="max-h-48 space-y-3 overflow-y-auto">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                {item.product.images?.[0] && (
                  <Image
                    src={item.product.images[0].url}
                    alt=""
                    className="h-full w-full object-contain"
                    width={48}
                    height={48}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="line-clamp-1 text-xs font-medium text-gray-900">
                  {item.product.name}
                </p>
                {item.variant && (
                  <p className="line-clamp-1 text-xs font-medium text-gray-900">
                    Variant: {item.variant.name} - {item.variant.value}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  ${Number(item.product.price).toFixed(2)} × {item.quantity}
                </p>
              </div>
              <p className="shrink-0 text-sm font-medium text-gray-900">
                ${item.subtotal.toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* totals */}
        <div className="mt-4 space-y-2 border-t pt-4 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          {/* ── DISCOUNT ROW ────────────────────────── */}
          {discount > 0 && (
            <div className="flex justify-between font-medium text-green-600">
              <span className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                Discount ({couponResult?.coupon.code})
              </span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-500">
            <span>Shipping</span>
            <span>
              {shipping === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                `$${shipping.toFixed(2)}`
              )}
            </span>
          </div>

          <div className="flex justify-between text-gray-500">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          {/* ── TOTAL ───────────────────────────────── */}
          <div className="flex justify-between border-t pt-3 text-base font-bold text-gray-900">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          {/* savings badge */}
          {discount > 0 && (
            <div className="rounded-md bg-green-50 px-3 py-2 text-center text-xs font-medium text-green-700">
              🎉 You&apos;re saving ${discount.toFixed(2)} on this order!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
