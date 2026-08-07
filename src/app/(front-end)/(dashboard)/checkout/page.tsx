'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import api from '@/lib/api';
import { stripePromise } from '@/lib/stripe';
import { useCartStore } from '@/store/cartStore';
import { Address } from '@/lib/types';
import AddressSelector from '@/components/checkout/AddressSelector';
import PaymentForm from '@/components/checkout/PaymentForm';
import { toast } from 'sonner';
import { ShoppingBag, CheckCircle, Tag, X } from 'lucide-react';
import Image from 'next/image';

type Step = 'address' | 'payment' | 'success';

interface CouponResult {
  discount: number;
  finalAmount: number;
  coupon: {
    code: string;
    type: string;
    value: number;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, fetchCart, clearCart } = useCartStore();

  const [step, setStep] = useState<Step>('address');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // ── coupon state ───────────────────────────────────
  const [couponCode, setCouponCode] = useState(cart?.couponCode || '');
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [orderId, setOrderId] = useState<number | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // ── INITIAL LOAD ────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        await fetchCart();
        const { data } = await api.get('/user/addresses');
        setAddresses(data);

        const defaultAddr = data.find((a: Address) => a.isDefault);
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        else if (data.length > 0) setSelectedAddressId(data[0].id);
      } catch {
        toast.error('Failed to load checkout');
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── INITIAL LOAD FOR COUPON ────────────────────────────────────
  useEffect(() => {
    const getCouponData = async () => {
      setCouponLoading(true);
      const { data } = await api
        .post('/coupons/validate', {
          code: cart!.couponCode,
          orderAmount: cart!.totalAmount,
        })
        .finally(() => {
          setCouponLoading(false);
        });

      setCouponResult(data);
    };

    if (cart && cart?.couponCode) {
      getCouponData();
    }
  }, [cart, couponCode]);

  // redirect if cart empty
  useEffect(() => {
    if (!loading && cart && cart.items.length === 0 && step !== 'success') {
      router.push('/cart');
    }
  }, [cart, loading, step, router]);

  // ── APPLY COUPON ────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !cart) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post('/coupons/validate', {
        code: couponCode,
        orderAmount: cart.totalAmount,
      });
      setCouponResult(data);
      //update cart
      await api.patch('cart/apply-coupon', {
        couponCode: data.coupon.code,
        discount: data.discount,
        finalAmount: data.finalAmount,
      });
      await fetchCart();

      toast.success(`Coupon applied! You save $${data.discount.toFixed(2)}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCouponResult(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    //update cart
    await api.patch('cart/remove-coupon');
    await fetchCart();

    setCouponResult(null);
    setCouponCode('');
  };

  // ── DERIVED AMOUNTS ─────────────────────────────────
  const subtotal = cart?.totalAmount || 0;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const discount = couponResult?.discount || 0;
  const taxBase = Math.max(0, subtotal - discount);
  const tax = taxBase * 0.08;
  const total = Math.max(0, taxBase + shipping + tax);

  // ── PLACE ORDER ─────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    setPlacingOrder(true);
    try {
      const { data: order } = await api.post('/orders', {
        addressId: selectedAddressId,
        couponCode: couponResult?.coupon.code,
      });
      setOrderId(order.id);

      const { data: payment } = await api.post('/payment/create-intent', {
        orderId: order.id,
      });
      setClientSecret(payment.clientSecret);

      setStep('payment');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  // ── PAYMENT SUCCESS ─────────────────────────────────
  const handlePaymentSuccess = () => {
    clearCart();
    setStep('success');
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // ── SUCCESS ─────────────────────────────────────────
  if (step === 'success') {
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
  }

  if (!cart || cart.items.length === 0) return null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Checkout</h1>

      {/* ── STEP INDICATOR ──────────────────────────────── */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <span className={step === 'address' ? 'font-semibold text-blue-600' : 'text-gray-400'}>
          1. Address
        </span>
        <span className="text-gray-300">→</span>
        <span className={step === 'payment' ? 'font-semibold text-blue-600' : 'text-gray-400'}>
          2. Payment
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* ── LEFT ──────────────────────────────────────── */}
        <div className="space-y-4 lg:col-span-2">
          {step === 'address' && (
            <>
              <AddressSelector
                addresses={addresses}
                selectedId={selectedAddressId}
                onSelect={setSelectedAddressId}
                onAddressCreated={(addr) => {
                  setAddresses((prev) => [...prev, addr]);
                  setSelectedAddressId(addr.id);
                }}
              />

              {/* ── COUPON ────────────────────────────────── */}
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
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
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

              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder || !selectedAddressId}
                className="w-full rounded-md bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {placingOrder ? 'Placing Order...' : 'Continue to Payment'}
              </button>
            </>
          )}

          {step === 'payment' && clientSecret && (
            <div className="rounded-lg border bg-white p-5">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Payment Details</h2>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm onSuccessAction={handlePaymentSuccess} />
              </Elements>
            </div>
          )}
        </div>

        {/* ── RIGHT — ORDER SUMMARY ───────────────────────── */}
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
      </div>
    </div>
  );
}
