import { CouponResult } from '@/lib/types';
import { Tag, X } from 'lucide-react';
import { ChangeEvent, FC } from 'react';

type Props = {
  couponResult: CouponResult | null;
  discount: number;
  couponCode: string;
  couponLoading: boolean;
  handleRemoveCoupon: () => void;
  handleApplyCoupon: () => void;
  onChangeCouponCode: (e: ChangeEvent<HTMLInputElement>) => void;
};

const Coupon: FC<Props> = ({
  couponResult,
  discount,
  couponCode,
  couponLoading,
  handleRemoveCoupon,
  handleApplyCoupon,
  onChangeCouponCode,
}) => {
  {
    /* ── COUPON ────────────────────────────────── */
  }
  return (
    <div className="rounded-lg border bg-white p-5">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
        <Tag className="h-4 w-4 text-blue-600" />
        Coupon Code
      </h2>

      {couponResult ? (
        // ── APPLIED STATE ────────────────────────
        <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-green-700">
              ✅ {couponResult.coupon.code} applied!
            </p>
            <p className="text-xs text-green-600">
              {couponResult.coupon.type === 'PERCENTAGE'
                ? `${couponResult.coupon.value}% off`
                : `$${Number(couponResult.coupon.value).toFixed(2)} off`}{' '}
              — saving <strong>${discount.toFixed(2)}</strong>
            </p>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="rounded-full p-1 text-green-600 hover:bg-green-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        // ── INPUT STATE ──────────────────────────
        <div className="flex gap-2">
          <input
            value={couponCode}
            onChange={onChangeCouponCode}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
            placeholder="Enter coupon code"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 font-mono text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleApplyCoupon}
            disabled={couponLoading || !couponCode.trim()}
            className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50"
          >
            {couponLoading ? '...' : 'Apply'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Coupon;
