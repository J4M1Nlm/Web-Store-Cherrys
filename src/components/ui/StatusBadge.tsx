import type { OrderStatus } from '../../types';

const statusConfig: Record<OrderStatus, { label: string; classes: string }> = {
  PENDING: { label: 'Pending', classes: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  PAID: { label: 'Paid', classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  FULFILLED: { label: 'Fulfilled', classes: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  CANCELLED: { label: 'Cancelled', classes: 'bg-red-500/20 text-red-300 border-red-500/30' },
  REFUNDED: { label: 'Refunded', classes: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}>
      {config.label}
    </span>
  );
}
