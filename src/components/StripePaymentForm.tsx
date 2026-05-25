import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useState } from 'react';
import GlassButton from './ui/GlassButton';

interface Props {
  total: number;
  currency: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export default function StripePaymentForm({ total, currency, onSuccess, onError }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/checkout/success' },
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message ?? 'Payment failed');
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <div className="mt-6">
        <GlassButton
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
          disabled={!stripe || !elements}
        >
          Pay {((total) / 100).toFixed(2)} {currency}
        </GlassButton>
      </div>
    </form>
  );
}
