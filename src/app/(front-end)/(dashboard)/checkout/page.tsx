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
import OrderSuccess from './OrderSuccess';
import OrderSummary from './OrderSummary';
import Coupon from './Coupon';

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
    return <OrderSuccess couponResult={couponResult} orderId={orderId} discount={discount} />;
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

              <Coupon
                couponResult={couponResult}
                discount={discount}
                couponCode={couponCode}
                couponLoading={couponLoading}
                handleRemoveCoupon={handleRemoveCoupon}
                handleApplyCoupon={handleApplyCoupon}
                onChangeCouponCode={(e) => setCouponCode(e.target.value.toUpperCase())}
              />

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
        <OrderSummary
          cart={cart}
          subtotal={subtotal}
          discount={discount}
          couponResult={couponResult}
          shipping={shipping}
          tax={tax}
          total={total}
        />
      </div>
    </div>
  );
}
