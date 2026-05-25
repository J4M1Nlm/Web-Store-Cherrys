import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';
import type { SpringPage, Order } from '../../types';
import { formatPrice } from '../../lib/format';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import StatusBadge from '../../components/ui/StatusBadge';
import { Skeleton } from '../../components/ui/Skeleton';

export default function Orders() {
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page],
    queryFn: () => api.get<SpringPage<Order>>('/orders', { params: { page, size: 10 } }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-6">Order History</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : !data?.content.length ? (
        <GlassCard className="p-12 text-center">
          <Package size={48} className="text-white/15 mx-auto mb-4" />
          <p className="text-white/40">No orders yet.</p>
          <Link to="/products" className="block mt-4 text-cherry text-sm hover:underline">Start shopping</Link>
        </GlassCard>
      ) : (
        <>
          <div className="space-y-3">
            {data.content.map((order) => (
              <Link key={order.id} to={`/account/orders/${order.id}`}>
                <GlassCard className="p-4 hover:border-white/20 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                        <Package size={16} className="text-white/40" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white font-mono">{order.orderNumber}</p>
                        <p className="text-xs text-white/40 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={order.status} />
                      <p className="text-sm font-semibold text-cherry">{formatPrice(order.totalCents, order.currency)}</p>
                      <ChevronRight size={14} className="text-white/30 group-hover:text-white/60 transition-colors" />
                    </div>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <GlassButton variant="ghost" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
                <ChevronLeft size={14} /> Prev
              </GlassButton>
              <span className="text-white/50 text-sm">Page {data.number + 1} of {data.totalPages}</span>
              <GlassButton variant="ghost" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= data.totalPages - 1}>
                Next <ChevronRight size={14} />
              </GlassButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}
