import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import api from '../lib/axios';
import type { Order } from '../types';
import { formatPrice } from '../lib/format';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import StatusBadge from '../components/ui/StatusBadge';

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');

  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => api.get<Order>(`/orders/${orderId}`).then((r) => r.data),
    enabled: !!orderId,
  });

  return (
    <div className="gradient-bg min-h-screen pt-24 pb-16 flex items-start justify-center">
      <div className="max-w-lg w-full mx-4 animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
            <CheckCircle size={40} className="text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
          <p className="text-white/40">Thank you for your purchase.</p>
        </div>

        {order && (
          <GlassCard className="p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Order number</p>
                <p className="font-mono font-semibold text-white">{order.orderNumber}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="space-y-2 mb-5">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-white/60">{item.productName} × {item.quantity}</span>
                  <span className="text-white">{formatPrice(item.subtotalCents, order.currency)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 flex justify-between font-semibold">
              <span className="text-white/70">Total paid</span>
              <span className="text-cherry text-lg">{formatPrice(order.totalCents, order.currency)}</span>
            </div>
          </GlassCard>
        )}

        <div className="flex gap-3">
          <Link to="/account/orders" className="flex-1">
            <GlassButton variant="ghost" className="w-full">
              <Package size={16} />
              View Orders
            </GlassButton>
          </Link>
          <Link to="/products" className="flex-1">
            <GlassButton variant="primary" className="w-full">
              Keep Shopping
              <ArrowRight size={16} />
            </GlassButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
