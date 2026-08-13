import { CouponResult } from '@/lib/types';
import { CheckCircle } from 'lucide-react';
import router from 'next/router';
import { FC } from 'react';

type Props = {
  couponResult: CouponResult | null;
  discount: number;
  orderId: number | null;
};

const OrderSuccess: FC<Props> = ({ couponResult, orderId, discount }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
      <h1 className="text-2xl font-bold text-gray-900">Order Placed!</h1>
      <p className="mt-2 text-gray-500">Your order #{orderId} has been confirmed.</p>
      {couponResult && (
        <p className="mt-1 text-sm text-green-600">
          You saved <strong>${discount.toFixed(2)}</strong> with coupon{' '}
          <strong>{couponResult.coupon.code}</strong>!
        </p>
      )}
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => router.push(`/orders/${orderId}`)}
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          View Order
        </button>
        <button
          onClick={() => router.push('/products')}
          className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
