import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, XCircle } from 'lucide-react';
import api from '../../lib/axios';
import type { SpringPage, Order, OrderStatus } from '../../types';
import { formatPrice } from '../../lib/format';
import AdminTable from '../../components/ui/AdminTable';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../store/toastStore';

export default function AdminOrderList() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [cancelId, setCancelId] = useState<number | null>(null);
  const qc = useQueryClient();
  const { success, error } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, status],
    queryFn: () =>
      api
        .get<SpringPage<Order>>('/admin/orders', { params: { page, size: 15, ...(status ? { status } : {}) } })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId: number) => api.post(`/admin/orders/${orderId}/cancel`),
    onSuccess: () => { setCancelId(null); qc.invalidateQueries(); success('Order cancelled'); },
    onError: () => error('Failed to cancel order'),
  });

  const columns = [
    { key: 'id', header: 'ID', render: (o: Order) => <span className="font-mono text-white">{o.id}</span> },
    { key: 'user', header: 'User', render: (o: Order) => <span className="text-white/60">{o.shippingAddress?.recipientName ?? o.id}</span> },
    { key: 'status', header: 'Status', render: (o: Order) => <StatusBadge status={o.status} /> },
    { key: 'total', header: 'Total', render: (o: Order) => <span className="text-cherry font-medium">{formatPrice(o.totalCents, o.currency)}</span> },
    { key: 'date', header: 'Date', render: (o: Order) => <span className="text-white/50 text-xs">{new Date(o.createdAt).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Orders</h1>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as OrderStatus | ''); setPage(0); }}
            className="glass-input px-3 py-2 rounded-xl text-sm"
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="FULFILLED">Fulfilled</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      <AdminTable
        columns={columns}
        page={data}
        loading={isLoading}
        onPageChange={setPage}
        actions={(o) => (
          <div className="flex items-center gap-2 justify-end">
            <Link to={`/admin/orders/${o.id}`} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
              <Eye size={14} />
            </Link>
            {(o.status === 'PENDING' || o.status === 'PAID') && (
              <button
                onClick={() => setCancelId(o.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
              >
                <XCircle size={14} />
              </button>
            )}
          </div>
        )}
      />

      <ConfirmModal
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={() => cancelId && cancelMutation.mutate(cancelId)}
        title="Cancel order"
        message="Are you sure you want to cancel this order?"
        loading={cancelMutation.isPending}
      />
    </div>
  );
}
