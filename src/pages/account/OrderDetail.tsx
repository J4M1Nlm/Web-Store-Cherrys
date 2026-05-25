import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, MapPin } from 'lucide-react';
import api from '../../lib/axios';
import type { Order } from '../../types';
import { formatPrice } from '../../lib/format';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { Skeleton } from '../../components/ui/Skeleton';

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => api.get<Order>(`/orders/${orderId}`).then((r) => r.data),
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-60 rounded-2xl" />
      </div>
    );
  }

  if (!order) return <p className="text-white/40">Order not found.</p>;

  return (
    <div>
      <Link to="/account/orders" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm mb-6">
        <ChevronLeft size={14} /> Back to orders
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white font-mono">{order.orderNumber}</h1>
          <p className="text-white/40 text-sm mt-1">{new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="space-y-4">
        {/* Items */}
        <GlassCard className="p-5">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-16 h-16 bg-white/5 rounded-xl overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10 text-xs">CT</div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{item.productName}</p>
                  {item.variantName && <p className="text-xs text-white/40">{item.variantName}</p>}
                  <p className="text-xs text-white/30">Qty: {item.quantity} × {formatPrice(item.unitPriceCents, order.currency)}</p>
                </div>
                <p className="text-sm font-semibold text-white">{formatPrice(item.subtotalCents, order.currency)}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Totals */}
        <GlassCard className="p-5">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">Payment</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-white/50">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotalCents, order.currency)}</span>
            </div>
            {order.discountCents > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount</span>
                <span>-{formatPrice(order.discountCents, order.currency)}</span>
              </div>
            )}
            {order.shippingCents > 0 && (
              <div className="flex justify-between text-white/50">
                <span>Shipping</span>
                <span>{formatPrice(order.shippingCents, order.currency)}</span>
              </div>
            )}
            {order.taxCents > 0 && (
              <div className="flex justify-between text-white/50">
                <span>Tax</span>
                <span>{formatPrice(order.taxCents, order.currency)}</span>
              </div>
            )}
            <div className="border-t border-white/10 pt-3 flex justify-between font-semibold text-base">
              <span className="text-white">Total</span>
              <span className="text-cherry">{formatPrice(order.totalCents, order.currency)}</span>
            </div>
          </div>
        </GlassCard>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <GlassCard className="p-5">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MapPin size={14} /> Shipping Address
            </h2>
            <div className="text-sm text-white/60">
              {order.shippingAddress.recipientName && <p className="text-white font-medium">{order.shippingAddress.recipientName}</p>}
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>{order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
