import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CreditCard as Edit2, Trash2, Check, X } from 'lucide-react';
import api from '../../lib/axios';
import type { DiscountType, SpringPage } from '../../types';
import { formatPrice } from '../../lib/format';
import AdminTable from '../../components/ui/AdminTable';
import GlassButton from '../../components/ui/GlassButton';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../store/toastStore';

interface Coupon {
  id: number;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxUses: number | null;
  currentUses: number;
  expiresAt: string | null;
  minOrderCents: number | null;
  active: boolean;
}

export default function CouponList() {
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const qc = useQueryClient();
  const { success, error } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['coupons', page],
    queryFn: () => api.get<SpringPage<Coupon>>('/admin/coupons', { params: { page, size: 15 } }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => api.put(`/admin/coupons/${id}/active`),
    onSuccess: () => { qc.invalidateQueries(); success('Coupon updated'); },
    onError: () => error('Failed to update coupon'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => { setDeleteId(null); qc.invalidateQueries(); success('Coupon deleted'); },
    onError: () => error('Failed to delete coupon'),
  });

  const columns = [
    { key: 'code', header: 'Code', render: (c: Coupon) => <span className="font-mono font-semibold text-white">{c.code}</span> },
    {
      key: 'type', header: 'Type', render: (c: Coupon) => (
        <span className="text-white/60">{c.discountType === 'PERCENT' ? 'Percent' : 'Fixed'}</span>
      ),
    },
    {
      key: 'value', header: 'Value', render: (c: Coupon) => (
        <span className="text-cherry">
          {c.discountType === 'PERCENT' ? `${c.discountValue}%` : formatPrice(c.discountValue, 'MXN')}
        </span>
      ),
    },
    { key: 'uses', header: 'Uses', render: (c: Coupon) => <span className="text-white/50">{c.currentUses}/{c.maxUses ?? '∞'}</span> },
    {
      key: 'expires', header: 'Expires', render: (c: Coupon) => (
        <span className="text-white/50 text-xs">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}</span>
      ),
    },
    {
      key: 'active', header: 'Active', render: (c: Coupon) => (
        <button
          onClick={() => toggleMutation.mutate(c.id)}
          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
            c.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/30'
          }`}
        >
          {c.active ? <Check size={12} /> : <X size={12} />}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Coupons</h1>
        <Link to="/admin/coupons/new">
          <GlassButton variant="primary" size="sm">Add Coupon</GlassButton>
        </Link>
      </div>

      <AdminTable
        columns={columns}
        page={data}
        loading={isLoading}
        onPageChange={setPage}
        actions={(c) => (
          <div className="flex items-center gap-2 justify-end">
            <Link to={`/admin/coupons/${c.id}/edit`} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
              <Edit2 size={14} />
            </Link>
            <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      />

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete coupon"
        message="Are you sure you want to delete this coupon?"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
