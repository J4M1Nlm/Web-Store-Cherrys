import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import { Check, ChevronRight, Plus, MapPin, Tag } from 'lucide-react';
import api from '../lib/axios';
import type { Address, CartResponse, CouponValidateResponse } from '../types';
import { formatPrice } from '../lib/format';
import GlassButton from '../components/ui/GlassButton';
import GlassCard from '../components/ui/GlassCard';
import GlassInput from '../components/ui/GlassInput';
import { useToast } from '../store/toastStore';
import { useCartStore } from '../store/cartStore';
import AddressForm from '../components/AddressForm';
import StripePaymentForm from '../components/StripePaymentForm';

const STEPS = ['Shipping', 'Coupon', 'Summary', 'Payment'];

export default function Checkout() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const cart = useCartStore((s) => s.cart);

  const [step, setStep] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidateResponse | null>(null);
  const [notes, setNotes] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const { data: addresses, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get<Address[]>('/users/addresses').then((r) => r.data),
    onSuccess: (data: Address[]) => {
      if (!selectedAddressId && data.length > 0) {
        const def = data.find((a) => a.isDefault) ?? data[0];
        setSelectedAddressId(def.id);
      }
    },
  } as Parameters<typeof useQuery>[0]);

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.get<CartResponse>('/cart').then((r) => r.data),
    initialData: cart ?? undefined,
  });

  const validateCouponMutation = useMutation({
    mutationFn: () => api.post<CouponValidateResponse>('/coupons/validate', { code: couponCode, subtotalCents: cartData?.subtotalCents ?? 0, currency: cartData?.currency ?? 'MXN' }).then((r) => r.data),
    onSuccess: (data) => { setAppliedCoupon(data); success(`Coupon applied: ${data.discountCents ? formatPrice(data.discountCents, cartData?.currency) + ' off' : data.discountValue + '% off'}`); },
    onError: () => error('Invalid or expired coupon code'),
  });

  const checkoutMutation = useMutation({
    mutationFn: () =>
      api.post<{ id: number }>('/orders/checkout', {
        shippingAddressId: selectedAddressId,
        billingAddressId: selectedAddressId,
        ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
        notes: notes || undefined,
      }).then((r) => r.data),
    onSuccess: (data) => { setOrderId(data.id); setStep(3); },
    onError: () => error('Failed to place order'),
  });

  const initPaymentMutation = useMutation({
    mutationFn: () => api.post<{ clientSecret: string }>('/payments/init', { orderId }).then((r) => r.data),
    onSuccess: (data) => setClientSecret(data.clientSecret),
    onError: () => error('Failed to initialize payment'),
  });

  useEffect(() => {
    if (step === 3 && orderId && !clientSecret) {
      initPaymentMutation.mutate();
    }
  }, [step, orderId]);

  const discount = appliedCoupon ? (appliedCoupon.discountCents ?? 0) : 0;
  const subtotal = cartData?.subtotalCents ?? 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="gradient-bg min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-cherry text-white shadow-[0_0_15px_rgba(232,41,76,0.5)]' : 'bg-white/10 text-white/30'
              }`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-white' : 'text-white/30'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-emerald-500/50' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        {/* Step 0: Shipping Address */}
        {step === 0 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin size={18} className="text-cherry" /> Shipping Address
            </h2>

            {showAddressForm ? (
              <GlassCard className="p-6">
                <AddressForm
                  onSuccess={() => { setShowAddressForm(false); refetchAddresses(); }}
                  onCancel={() => setShowAddressForm(false)}
                />
              </GlassCard>
            ) : (
              <>
                {addresses && addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <GlassCard
                        key={addr.id}
                        className={`p-4 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-cherry/50 shadow-[0_0_20px_rgba(232,41,76,0.15)]' : 'hover:border-white/20'}`}
                        onClick={() => setSelectedAddressId(addr.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 transition-all ${selectedAddressId === addr.id ? 'border-cherry bg-cherry' : 'border-white/30'}`} />
                          <div>
                            {addr.label && <p className="text-xs text-white/40 mb-0.5">{addr.label}</p>}
                            <p className="text-sm text-white font-medium">{addr.recipientName}</p>
                            <p className="text-xs text-white/50">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                            <p className="text-xs text-white/50">{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}</p>
                            <p className="text-xs text-white/50">{addr.country}</p>
                          </div>
                          {addr.isDefault && (
                            <span className="ml-auto text-xs text-cherry border border-cherry/30 px-2 py-0.5 rounded-full">Default</span>
                          )}
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                ) : (
                  <GlassCard className="p-8 text-center">
                    <p className="text-white/40 text-sm mb-4">No saved addresses. Add one to continue.</p>
                  </GlassCard>
                )}

                <button
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center gap-2 text-sm text-cherry hover:text-cherry/80 transition-colors"
                >
                  <Plus size={14} /> Add new address
                </button>
              </>
            )}

            <div className="flex justify-end pt-2">
              <GlassButton
                variant="primary"
                onClick={() => setStep(1)}
                disabled={!selectedAddressId}
              >
                Continue
                <ChevronRight size={16} />
              </GlassButton>
            </div>
          </div>
        )}

        {/* Step 1: Coupon */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Tag size={18} className="text-cherry" /> Coupon Code (optional)
            </h2>

            <GlassCard className="p-6">
              <div className="flex gap-3">
                <GlassInput
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1"
                />
                <GlassButton
                  variant="ghost"
                  onClick={() => validateCouponMutation.mutate()}
                  loading={validateCouponMutation.isPending}
                  disabled={!couponCode}
                >
                  Apply
                </GlassButton>
              </div>

              {appliedCoupon && (
                <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm">
                  <Check size={14} />
                  Coupon <strong>{appliedCoupon.code}</strong> applied!
                </div>
              )}
            </GlassCard>

            <GlassCard className="p-4">
              <GlassInput
                label="Order notes (optional)"
                placeholder="Any special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </GlassCard>

            <div className="flex justify-between pt-2">
              <GlassButton variant="ghost" onClick={() => setStep(0)}>Back</GlassButton>
              <GlassButton variant="primary" onClick={() => setStep(2)}>
                Continue <ChevronRight size={16} />
              </GlassButton>
            </div>
          </div>
        )}

        {/* Step 2: Summary */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-white">Order Summary</h2>

            <GlassCard className="p-5 space-y-3 text-sm">
              {cartData?.items.map((item) => (
                <div key={item.itemId} className="flex justify-between text-white/70">
                  <span>{item.productName} × {item.quantity}</span>
                  <span>{formatPrice(item.subtotalCents, cartData.currency)}</span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-3 space-y-2">
                <div className="flex justify-between text-white/50">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal, cartData?.currency ?? 'MXN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-{formatPrice(discount, cartData?.currency ?? 'MXN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-semibold text-base pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-cherry">{formatPrice(total, cartData?.currency ?? 'MXN')}</span>
                </div>
              </div>
            </GlassCard>

            <div className="flex justify-between pt-2">
              <GlassButton variant="ghost" onClick={() => setStep(1)}>Back</GlassButton>
              <GlassButton
                variant="primary"
                size="lg"
                onClick={() => checkoutMutation.mutate()}
                loading={checkoutMutation.isPending}
              >
                Place Order
              </GlassButton>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && orderId && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-white">Payment</h2>

            <GlassCard className="p-8 text-center">
              <h3 className="text-white font-semibold mb-2">Order #{orderId}</h3>
              <p className="text-white/40 text-sm mb-6">Total: {formatPrice(total, cartData?.currency ?? 'MXN')}</p>

              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripePaymentForm
                    total={total}
                    currency={cartData?.currency ?? 'MXN'}
                    onSuccess={() => { success('Payment successful!'); navigate(`/checkout/success?orderId=${orderId}`); }}
                    onError={(msg) => { setPaymentError(msg); error(msg); }}
                  />
                </Elements>
              ) : (
                <div className="py-4 text-white/40 text-sm">
                  {initPaymentMutation.isPending ? 'Initializing payment...' : paymentError ?? 'Initializing...'}
                </div>
              )}
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
