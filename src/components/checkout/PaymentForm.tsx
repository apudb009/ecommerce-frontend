'use client';

import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock } from 'lucide-react';

type PaymentFormProps = {
  onSuccessAction: () => void;
};

export default function PaymentForm({ onSuccessAction }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    // confirm payment with Stripe
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', // stay on page unless 3D Secure needed
    });

    if (stripeError) {
      setError(stripeError.message || 'Payment failed');
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      onSuccessAction();
    } else {
      setError('Payment processing. Please wait a moment...');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Lock className="h-4 w-4" />
        {loading ? 'Processing...' : 'Pay Now'}
      </button>

      <p className="text-center text-xs text-gray-400">
        Test card: 4242 4242 4242 4242, any future date, any CVC
      </p>
    </form>
  );
}
