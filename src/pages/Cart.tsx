import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import api from '../lib/axios';
import type { CartResponse } from '../types';
import { formatPrice } from '../lib/format';
import { Skeleton } from '../components/ui/Skeleton';
import GlassButton from '../components/ui/GlassButton';
import GlassCard from '../components/ui/GlassCard';
import { useCartStore } from '../store/cartStore';
import { useToast } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';
import PageTransition from '../components/PageTransition';

export default function Cart() {
  const { token } = useAuthStore();
  const setCart = useCartStore((s) => s.setCart);
  const { error } = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.get<CartResponse>('/cart').then((r) => r.data),
    enabled: !!token,
    onSuccess: (data: CartResponse) => setCart(data),
  } as Parameters<typeof useQuery>[0]);

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      api.put<CartResponse>(`/cart/items/${itemId}`, { quantity }).then((r) => r.data),
    onSuccess: (data) => { setCart(data); qc.setQueryData(['cart'], data); },
    onError: () => error('Failed to update cart'),
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: number) =>
      api.delete<CartResponse>(`/cart/items/${itemId}`).then((r) => r.data),
    onSuccess: (data) => { setCart(data); qc.setQueryData(['cart'], data); },
    onError: () => error('Failed to remove item'),
  });

  if (!token) {
    return (
      <PageTransition>
      <div className="gradient-bg min-h-screen pt-24 flex items-center justify-center">
        <GlassCard className="p-10 text-center max-w-sm w-full mx-4">
          <ShoppingBag size={48} className="text-white/20 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Sign in to view your cart</h2>
          <p className="text-white/40 text-sm mb-6">Your cart is waiting for you.</p>
          <Link to="/login"><GlassButton variant="primary" className="w-full">Sign in</GlassButton></Link>
        </GlassCard>
      </div>
      </PageTransition>
    );
  }

  if (isLoading) {
    return (
      <div className="gradient-bg min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <Skeleton className="h-8 w-24 mb-8" />
          <div className="space-y-4">
            {[1,2,3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <PageTransition>
    <div className="gradient-bg min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Your Cart</h1>

        {isEmpty ? (
          <GlassCard className="p-16 text-center">
            <ShoppingBag size={56} className="text-white/15 mx-auto mb-5" />
            <h2 className="text-xl font-semibold text-white mb-2">Your cart is empty</h2>
            <p className="text-white/40 text-sm mb-8">Time to discover something you love.</p>
            <Link to="/products">
              <GlassButton variant="primary">Browse Collection</GlassButton>
            </Link>
          </GlassCard>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 space-y-3">
              {cart.items.map((item, i) => (
                <GlassCard key={item.id} className={`p-4 flex gap-4 animate-stagger-${i + 1}`}>
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                    {item.mainImageUrl ? (
                      <img src={item.mainImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10 text-xs">CT</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white line-clamp-1">{item.productName}</h3>
                    {item.variantName && <p className="text-xs text-white/40 mt-0.5">{item.variantName}</p>}
                    <p className="text-xs text-white/30 mt-0.5">SKU: {item.sku}</p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => item.quantity > 1 && updateMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                          className="w-7 h-7 glass-card rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                          className="w-7 h-7 glass-card rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold text-cherry">{formatPrice(item.lineTotalCents, cart.currency)}</p>
                        <button
                          onClick={() => removeMutation.mutate(item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-white/30 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <GlassCard className="p-5 sticky top-24 card-hover">
                <h2 className="font-semibold text-white mb-5">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-white/50">
                    <span>Subtotal ({cart.itemsCount} items)</span>
                    <span>{formatPrice(cart.subtotalCents, cart.currency)}</span>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>Shipping</span>
                    <span className="text-white/30">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between font-semibold text-white">
                    <span>Total</span>
                    <span className="text-cherry">{formatPrice(cart.subtotalCents, cart.currency)}</span>
                  </div>
                </div>

                <GlassButton
                  variant="primary"
                  size="lg"
                  className="w-full mt-5"
                  onClick={() => navigate('/checkout')}
                >
                  Checkout
                  <ArrowRight size={16} />
                </GlassButton>

                <Link to="/products" className="block text-center mt-4 text-xs text-white/30 hover:text-white/60 transition-colors">
                  Continue shopping
                </Link>
              </GlassCard>
            </div>
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  );
}
