import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import type { DiscountType, Coupon } from '../../types';
import GlassCard from '../../components/ui/GlassCard';
import GlassInput from '../../components/ui/GlassInput';
import GlassButton from '../../components/ui/GlassButton';
import { useToast } from '../../store/toastStore';

interface CouponFormState {
  code: string;
  discountType: DiscountType;
  discountValue: string;
  maxUses: string;
  expiresAt: string;
  minOrderPesos: string;
}

export default function CouponForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { success, error } = useToast();
  const isEdit = !!id;

  const [form, setForm] = useState<CouponFormState>({
    code: '',
    discountType: 'PERCENT',
    discountValue: '',
    maxUses: '',
    expiresAt: '',
    minOrderPesos: '',
  });

  const { data: coupon } = useQuery({
    queryKey: ['coupon', id],
    queryFn: () => api.get<Coupon>(`/admin/coupons/${id}`).then((r) => r.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (coupon) {
      setForm({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: String(coupon.discountValue),
        maxUses: coupon.maxUses ? String(coupon.maxUses) : '',
        expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
        minOrderPesos: coupon.minOrderCents ? String(coupon.minOrderCents / 100) : '',
      });
    }
  }, [coupon]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt ? `${form.expiresAt}T23:59:59` : null,
        minOrderCents: form.minOrderPesos ? Math.round(Number(form.minOrderPesos) * 100) : null,
      };
      return isEdit
        ? api.put(`/admin/coupons/${id}`, payload)
        : api.post('/admin/coupons', payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons'] });
      success(isEdit ? 'Coupon updated!' : 'Coupon created!');
      navigate('/admin/coupons');
    },
    onError: () => error('Failed to save coupon'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.discountValue) { error('Code and value are required'); return; }
    mutation.mutate();
  };

  const set = (field: keyof CouponFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-white mb-6">{isEdit ? 'Edit Coupon' : 'New Coupon'}</h1>

      <GlassCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput label="Code *" value={form.code} onChange={set('code')} placeholder="SAVE20" maxLength={40} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-white/70 block mb-1.5">Type *</label>
              <select value={form.discountType} onChange={set('discountType')} className="glass-input px-4 py-3 rounded-xl w-full text-sm">
                <option value="PERCENT">Percent (%)</option>
                <option value="FIXED">Fixed ($)</option>
              </select>
            </div>
            <GlassInput
              label={form.discountType === 'PERCENT' ? 'Percent *' : 'Amount (MXN) *'}
              type="number"
              step={form.discountType === 'PERCENT' ? '1' : '0.01'}
              value={form.discountValue}
              onChange={set('discountValue')}
              placeholder={form.discountType === 'PERCENT' ? '20' : '100.00'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <GlassInput label="Max uses (optional)" type="number" value={form.maxUses} onChange={set('maxUses')} placeholder="Unlimited" />
            <GlassInput label="Expires at (optional)" type="date" value={form.expiresAt} onChange={set('expiresAt')} />
          </div>

          <GlassInput label="Min order (MXN, optional)" type="number" step="0.01" value={form.minOrderPesos} onChange={set('minOrderPesos')} placeholder="500.00" />

          <div className="flex gap-3 pt-3">
            <GlassButton type="button" variant="ghost" onClick={() => navigate('/admin/coupons')}>Cancel</GlassButton>
            <GlassButton type="submit" variant="primary" loading={mutation.isPending}>
              {isEdit ? 'Save' : 'Create'}
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
