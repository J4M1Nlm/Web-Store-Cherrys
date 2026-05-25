import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, MapPin, RefreshCcw } from 'lucide-react';
import api from '../../lib/axios';
import type { Order, OrderStatus } from '../../types';
import { formatPrice } from '../../lib/format';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import GlassSelect from '../../components/ui/GlassInput';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../store/toastStore';

export default function AdminOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const qc = useQueryClient();
  const { success, error } = useToast();
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [showRefund, setShowRefund] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => api.get<Order>(`/admin/orders/${orderId}`).then((r) => r.data),
    enabled: !!orderId,
  });

  const statusMutation = useMutation({
    mutationFn: () => api.put(`/admin/orders/${orderId}/status`, { status: newStatus }),
    onSuccess: () => { qc.invalidateQueries(); setNewStatus(''); success('Status updated'); },
    onError: () => error('Failed to update status'),
  });

  const refundMutation = useMutation({
    mutationFn: () => api.post('/admin/payments/refund', { orderId: Number(orderId) }),
    onSuccess: () => { setShowRefund(false); qc.invalidateQueries(); success('Refund initiated'); },
    onError: () => error('Failed to process refund'),
  });

  if (isLoading) return <div className="text-white/40">Loading...</div>;
  if (!order) return <div className="text-white/40">Order not found.</div>;

  const statusOptions: OrderStatus[] = ['PENDING', 'PAID', 'FULFILLED', 'CANCELLED', 'REFUNDED'];

  return (
    <div className="space-y-5">
      <Link to="/admin/orders" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm">
        <ChevronLeft size={14} /> Orders
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white font-mono">{order.orderNumber}</h1>
          <p className="text-white/40 text-sm mt-1">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Change status */}
      <GlassCard className="p-5">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">Update Status</h2>
        <div className="flex items-center gap-3">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
            className="glass-input px-4 py-2.5 rounded-xl text-sm"
          >
            <option value="">Select new status</option>
            {statusOptions.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
          <GlassButton
            variant="primary"
            size="sm"
            onClick={() => statusMutation.mutate()}
            disabled={!newStatus || newStatus === order.status}
            loading={statusMutation.isPending}
          >
            Update
          </GlassButton>
        </div>
      </GlassCard>

      {/* Items */}
      <GlassCard className="p-5">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">Items</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
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
          <div className="flex justify-between text-white/50"><span>Subtotal</span><span>{formatPrice(order.subtotalCents, order.currency)}</span></div>
          {order.discountCents > 0 && <div className="flex justify-between text-emerald-400"><span>Discount</span><span>-{formatPrice(order.discountCents, order.currency)}</span></div>}
          {order.shippingCents > 0 && <div className="flex justify-between text-white/50"><span>Shipping</span><span>{formatPrice(order.shippingCents, order.currency)}</span></div>}
          {order.taxCents > 0 && <div className="flex justify-between text-white/50"><span>Tax</span><span>{formatPrice(order.taxCents, order.currency)}</span></div>}
          <div className="border-t border-white/10 pt-3 flex justify-between font-semibold text-base">
            <span className="text-white">Total</span>
            <span className="text-cherry">{formatPrice(order.totalCents, order.currency)}</span>
          </div>
        </div>

        {order.status === 'PAID' && (
          <GlassButton
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => setShowRefund(true)}
          >
            <RefreshCcw size={14} /> Initiate Refund
          </GlassButton>
        )}
      </GlassCard>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <GlassCard className="p-5">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2">
            <MapPin size={14} /> Shipping Address
          </h2>
          <div className="text-sm text-white/70">
            {order.shippingAddress.recipientName && <p className="font-medium text-white">{order.shippingAddress.recipientName}</p>}
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
            <p>{order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''} {order.shippingAddress.postalCode}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </GlassCard>
      )}

      <ConfirmModal
        open={showRefund}
        onClose={() => setShowRefund(false)}
        onConfirm={() => refundMutation.mutate()}
        title="Process refund"
        message="This will initiate a refund for this order. Continue?"
        confirmLabel="Refund"
        loading={refundMutation.isPending}
      />
    </div>
  );
}
