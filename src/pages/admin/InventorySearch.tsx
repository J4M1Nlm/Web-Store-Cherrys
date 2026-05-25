import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Package, List, Info } from 'lucide-react';
import api from '../../lib/axios';
import GlassCard from '../../components/ui/GlassCard';
import GlassInput from '../../components/ui/GlassInput';
import GlassButton from '../../components/ui/GlassButton';
import GlassModal from '../../components/ui/GlassModal';
import AdminTable from '../../components/ui/AdminTable';
import { useToast } from '../../store/toastStore';
import type { SpringPage } from '../../types';

interface VariantInfo {
  variantId: number;
  sku: string;
  variantName: string | null;
  attributes: Record<string, string>;
  stockOnHand: number;
  productName: string;
}

interface Movement {
  id: number;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  stockAfter: number;
  notes: string | null;
  createdAt: string;
}

export default function InventorySearch() {
  const [variantIdInput, setVariantIdInput] = useState('');
  const [searchedId, setSearchedId] = useState<number | null>(null);
  const [showAdjust, setShowAdjust] = useState(false);
  const [showMovements, setShowMovements] = useState(false);
  const qc = useQueryClient();
  const { success, error } = useToast();

  const { data: variant, isLoading, refetch } = useQuery({
    queryKey: ['inventory-variant', searchedId],
    queryFn: () => api.get<VariantInfo>(`/admin/inventory/variants/${searchedId}`).then((r) => r.data),
    enabled: !!searchedId,
  });

  const { data: movements } = useQuery({
    queryKey: ['inventory-movements', searchedId],
    queryFn: () => api.get<SpringPage<Movement>>(`/admin/inventory/variants/${searchedId}/movements`).then((r) => r.data),
    enabled: !!searchedId && showMovements,
  });

  const adjustMutation = useMutation({
    mutationFn: (data: { movementType: string; quantity: number; notes?: string }) =>
      api.post('/admin/inventory/adjust', { variantId: searchedId, ...data }),
    onSuccess: () => { qc.invalidateQueries(); setShowAdjust(false); success('Stock adjusted'); refetch(); },
    onError: () => error('Failed to adjust stock'),
  });

  const handleSearch = () => {
    const id = Number(variantIdInput);
    if (!id || isNaN(id)) { error('Please enter a valid variant ID'); return; }
    setSearchedId(id);
    setShowMovements(false);
  };

  const [adjustForm, setAdjustForm] = useState({ movementType: 'IN', quantity: '', notes: '' });

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustForm.quantity) { error('Quantity is required'); return; }
    adjustMutation.mutate({
      movementType: adjustForm.movementType,
      quantity: Number(adjustForm.quantity),
      notes: adjustForm.notes || undefined,
    });
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-white">Inventory</h1>

      <GlassCard className="p-5">
        <div className="flex gap-3">
          <GlassInput
            placeholder="Enter variant ID..."
            value={variantIdInput}
            onChange={(e) => setVariantIdInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <GlassButton variant="primary" onClick={handleSearch}>
            <Search size={14} /> Search
          </GlassButton>
        </div>
      </GlassCard>

      {isLoading && <GlassCard className="p-5 text-center text-white/40">Searching...</GlassCard>}

      {variant && (
        <GlassCard className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-white/40">Product</p>
              <p className="text-lg font-semibold text-white">{variant.productName}</p>
              <p className="text-xs font-mono text-white/50 mt-1">SKU: {variant.sku}</p>
              {variant.variantName && <p className="text-sm text-white/50">{variant.variantName}</p>}
            </div>
            <div className="text-right">
              <p className="text-sm text-white/40">Stock on hand</p>
              <p className={`text-3xl font-bold ${variant.stockOnHand === 0 ? 'text-red-400' : 'text-white'}`}>
                {variant.stockOnHand}
              </p>
            </div>
          </div>

          {Object.keys(variant.attributes).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {Object.entries(variant.attributes).map(([k, v]) => (
                <span key={k} className="px-2.5 py-1 rounded-full text-xs bg-white/10 text-white/60">{k}: {v}</span>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <GlassButton variant="primary" size="sm" onClick={() => setShowAdjust(true)}>
              Adjust Stock
            </GlassButton>
            <GlassButton variant="ghost" size="sm" onClick={() => setShowMovements((s) => !s)}>
              <List size={14} /> View Movements
            </GlassButton>
          </div>
        </GlassCard>
      )}

      {!variant && searchedId && !isLoading && (
        <GlassCard className="p-5 text-center">
          <Package size={40} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/40">Variant not found</p>
        </GlassCard>
      )}

      {showMovements && movements && (
        <GlassCard className="p-5">
          <h2 className="font-semibold text-white mb-4">Stock Movements</h2>
          <AdminTable
            columns={[
              { key: 'date', header: 'Date', render: (m) => <span className="text-white/50 text-xs">{new Date(m.createdAt).toLocaleString()}</span> },
              { key: 'type', header: 'Type', render: (m) => {
                const colors = { IN: 'text-emerald-400', OUT: 'text-amber-400', ADJUST: 'text-blue-400' };
                return <span className={`font-medium ${colors[m.type]}`}>{m.type}</span>;
              }},
              { key: 'qty', header: 'Qty', render: (m) => <span className={m.type === 'OUT' || (m.type === 'ADJUST' && m.quantity < 0) ? 'text-red-400' : 'text-emerald-400'}>{m.quantity > 0 ? '+' : ''}{m.quantity}</span> },
              { key: 'after', header: 'Stock After', render: (m) => <span className="text-white">{m.stockAfter}</span> },
              { key: 'notes', header: 'Notes', render: (m) => <span className="text-white/40 text-xs">{m.notes ?? '-'}</span> },
            ]}
            page={movements}
            emptyMessage="No movements yet"
          />
        </GlassCard>
      )}

      {/* Adjust Modal */}
      <GlassModal open={showAdjust} onClose={() => setShowAdjust(false)} title="Adjust Stock" maxWidth="max-w-sm">
        <form onSubmit={handleAdjust} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white/70 block mb-1.5">Type</label>
              <select
                value={adjustForm.movementType}
                onChange={(e) => setAdjustForm((f) => ({ ...f, movementType: e.target.value }))}
                className="glass-input px-4 py-3 rounded-xl w-full text-sm"
              >
                <option value="IN">IN - Add stock</option>
                <option value="OUT">OUT - Remove stock</option>
                <option value="ADJUST">ADJUST - Set directly</option>
              </select>
            </div>
            <GlassInput
              label="Quantity *"
              type="number"
              value={adjustForm.quantity}
              onChange={(e) => setAdjustForm((f) => ({ ...f, quantity: e.target.value }))}
              placeholder="Enter quantity"
            />
            {adjustForm.movementType === 'ADJUST' && (
            <p className="text-xs text-white/40 flex items-start gap-1.5">
              <Info size={12} className="mt-0.5 flex-shrink-0" />
              Use negative quantity to reduce stock directly (e.g., -5 to reduce by 5).
            </p>
          )}
          <GlassInput
            label="Notes (optional)"
            value={adjustForm.notes}
            onChange={(e) => setAdjustForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Reason for adjustment..."
          />
          <div className="flex gap-3 pt-2">
            <GlassButton type="button" variant="ghost" className="flex-1" onClick={() => setShowAdjust(false)}>Cancel</GlassButton>
            <GlassButton type="submit" variant="primary" className="flex-1" loading={adjustMutation.isPending}>Adjust</GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
