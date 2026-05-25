import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CreditCard as Edit2, Trash2, ChevronLeft } from 'lucide-react';
import api from '../../lib/axios';
import type { ProductDetail } from '../../types';
import { formatPrice } from '../../lib/format';
import AdminTable from '../../components/ui/AdminTable';
import GlassCard from '../../components/ui/GlassCard';
import GlassInput from '../../components/ui/GlassInput';
import GlassButton from '../../components/ui/GlassButton';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../store/toastStore';

interface Variant {
  id: number;
  sku: string;
  variantName: string | null;
  attributes: Record<string, string>;
  priceCents: number;
  stockOnHand: number;
  isActive: boolean;
}

export default function ProductVariants() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { success, error } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editVariant, setEditVariant] = useState<Variant | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [attrKey, setAttrKey] = useState('');
  const [attrValue, setAttrValue] = useState('');

  const [form, setForm] = useState({
    sku: '',
    variantName: '',
    pricePesos: '',
    stockOnHand: '',
    attributes: {} as Record<string, string>,
  });

  const { data: product } = useQuery({
    queryKey: ['product-detail', id],
    queryFn: () => api.get<ProductDetail>(`/admin/catalog/products/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const { data: variants } = useQuery({
    queryKey: ['product-variants', id],
    queryFn: () => api.get<Variant[]>(`/admin/catalog/products/${id}/variants`).then((r) => r.data),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: () => api.post(`/admin/catalog/products/${id}/variants`, {
      sku: form.sku,
      variantName: form.variantName || null,
      priceCents: Math.round(Number(form.pricePesos) * 100),
      stockOnHand: Number(form.stockOnHand) || 0,
      attributes: form.attributes,
    }),
    onSuccess: () => { qc.invalidateQueries(); resetForm(); success('Variant created'); },
    onError: () => error('Failed to create variant'),
  });

  const updateMutation = useMutation({
    mutationFn: () => api.put(`/admin/catalog/products/${id}/variants/${editVariant?.id}`, {
      sku: form.sku,
      variantName: form.variantName || null,
      priceCents: Math.round(Number(form.pricePesos) * 100),
      stockOnHand: Number(form.stockOnHand) || 0,
      attributes: form.attributes,
    }),
    onSuccess: () => { qc.invalidateQueries(); resetForm(); success('Variant updated'); },
    onError: () => error('Failed to update variant'),
  });

  const deleteMutation = useMutation({
    mutationFn: (variantId: number) => api.delete(`/admin/catalog/products/${id}/variants/${variantId}`),
    onSuccess: () => { setDeleteId(null); qc.invalidateQueries(); success('Variant deleted'); },
    onError: () => error('Failed to delete variant'),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditVariant(null);
    setForm({ sku: '', variantName: '', pricePesos: '', stockOnHand: '', attributes: {} });
    setAttrKey('');
    setAttrValue('');
  };

  const startEdit = (v: Variant) => {
    setEditVariant(v);
    setForm({
      sku: v.sku,
      variantName: v.variantName ?? '',
      pricePesos: String(v.priceCents / 100),
      stockOnHand: String(v.stockOnHand),
      attributes: { ...v.attributes },
    });
    setShowForm(true);
  };

  const addAttribute = () => {
    if (attrKey && attrValue) {
      setForm((f) => ({ ...f, attributes: { ...f.attributes, [attrKey]: attrValue } }));
      setAttrKey('');
      setAttrValue('');
    }
  };

  const removeAttribute = (key: string) => {
    setForm((f) => {
      const { [key]: _, ...rest } = f.attributes;
      return { ...f, attributes: rest };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sku || !form.pricePesos) { error('SKU and price are required'); return; }
    editVariant ? updateMutation.mutate() : createMutation.mutate();
  };

  const columns = [
    { key: 'sku', header: 'SKU', render: (v: Variant) => <span className="font-mono text-white">{v.sku}</span> },
    { key: 'name', header: 'Name', render: (v: Variant) => v.variantName ?? <span className="text-white/30">-</span> },
    {
      key: 'attrs', header: 'Attributes', render: (v: Variant) => (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(v.attributes).map(([k, val]) => (
            <span key={k} className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/60">{k}: {val}</span>
          ))}
        </div>
      ),
    },
    { key: 'price', header: 'Price', render: (v: Variant) => <span className="text-cherry font-medium">{formatPrice(v.priceCents)}</span> },
    { key: 'stock', header: 'Stock', render: (v: Variant) => <span className={v.stockOnHand === 0 ? 'text-red-400' : 'text-white/70'}>{v.stockOnHand}</span> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 mb-4">
        <Link to="/admin/products" className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Variants</h1>
          <p className="text-white/40 text-sm">{product?.name}</p>
        </div>
      </div>

      {!showForm && (
        <GlassButton variant="primary" size="sm" onClick={() => setShowForm(true)}>
          <Plus size={14} /> Add Variant
        </GlassButton>
      )}

      {showForm && (
        <GlassCard className="p-5">
          <h2 className="font-semibold text-white mb-4">{editVariant ? 'Edit' : 'New'} Variant</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <GlassInput label="SKU *" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} placeholder="SKU-001" />
              <GlassInput label="Name" value={form.variantName} onChange={(e) => setForm((f) => ({ ...f, variantName: e.target.value }))} placeholder="Variant name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <GlassInput label="Price (MXN) *" type="number" step="0.01" value={form.pricePesos} onChange={(e) => setForm((f) => ({ ...f, pricePesos: e.target.value }))} placeholder="0.00" />
              <GlassInput label="Stock" type="number" value={form.stockOnHand} onChange={(e) => setForm((f) => ({ ...f, stockOnHand: e.target.value }))} placeholder="0" />
            </div>

            {/* Dynamic attributes */}
            <div>
              <label className="text-sm font-medium text-white/70 block mb-2">Attributes</label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {Object.entries(form.attributes).map(([k, v]) => (
                  <span key={k} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-cherry/20 text-cherry border border-cherry/30">
                    {k}: {v}
                    <button type="button" onClick={() => removeAttribute(k)} className="hover:text-white">&times;</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <GlassInput placeholder="Key (e.g. Size)" value={attrKey} onChange={(e) => setAttrKey(e.target.value)} className="flex-1" />
                <GlassInput placeholder="Value (e.g. M)" value={attrValue} onChange={(e) => setAttrValue(e.target.value)} className="flex-1" />
                <GlassButton type="button" variant="ghost" size="sm" onClick={addAttribute}>Add</GlassButton>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <GlassButton type="button" variant="ghost" onClick={resetForm}>Cancel</GlassButton>
              <GlassButton type="submit" variant="primary" loading={createMutation.isPending || updateMutation.isPending}>
                {editVariant ? 'Save' : 'Create'}
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      )}

      <AdminTable
        columns={columns}
        data={variants}
        loading={!variants}
        actions={(v) => (
          <div className="flex items-center gap-2 justify-end">
            <button onClick={() => startEdit(v)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
              <Edit2 size={14} />
            </button>
            <button onClick={() => setDeleteId(v.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      />

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete variant"
        message="Are you sure you want to delete this variant?"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
