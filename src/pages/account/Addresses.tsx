import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, CreditCard as Edit2, MapPin, Star } from 'lucide-react';
import api from '../../lib/axios';
import type { Address } from '../../types';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import GlassModal from '../../components/ui/GlassModal';
import AddressForm from '../../components/AddressForm';
import { useToast } from '../../store/toastStore';

export default function Addresses() {
  const { success, error } = useToast();
  const qc = useQueryClient();
  const [editAddress, setEditAddress] = useState<Address | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get<Address[]>('/users/addresses').then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/users/addresses/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); success('Address deleted'); },
    onError: () => error('Failed to delete address'),
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: number) => api.put(`/users/addresses/${id}/default`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); success('Default address updated'); },
    onError: () => error('Failed to update default'),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Address Book</h1>
        <GlassButton variant="primary" size="sm" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Add Address
        </GlassButton>
      </div>

      {!addresses?.length ? (
        <GlassCard className="p-12 text-center">
          <MapPin size={40} className="text-white/15 mx-auto mb-4" />
          <p className="text-white/40">No saved addresses yet.</p>
        </GlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <GlassCard key={addr.id} className={`p-4 ${addr.isDefault ? 'border-cherry/30 shadow-[0_0_15px_rgba(232,41,76,0.1)]' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {addr.label && <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{addr.label}</span>}
                  {addr.isDefault && (
                    <span className="text-xs text-cherry flex items-center gap-1">
                      <Star size={10} fill="currentColor" /> Default
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditAddress(addr)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white">
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => !addr.isDefault && deleteMutation.mutate(addr.id)}
                    disabled={addr.isDefault}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-white/40 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="text-sm text-white/70">
                {addr.recipientName && <p className="font-medium text-white mb-1">{addr.recipientName}</p>}
                <p>{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}</p>
                <p>{addr.country}</p>
              </div>
              {!addr.isDefault && (
                <button
                  onClick={() => setDefaultMutation.mutate(addr.id)}
                  className="mt-3 text-xs text-white/30 hover:text-cherry transition-colors"
                >
                  Set as default
                </button>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      <GlassModal open={showAdd} onClose={() => setShowAdd(false)} title="Add Address" maxWidth="max-w-xl">
        <AddressForm
          onSuccess={() => { setShowAdd(false); qc.invalidateQueries({ queryKey: ['addresses'] }); }}
          onCancel={() => setShowAdd(false)}
        />
      </GlassModal>

      <GlassModal open={!!editAddress} onClose={() => setEditAddress(null)} title="Edit Address" maxWidth="max-w-xl">
        {editAddress && (
          <AddressForm
            address={editAddress}
            onSuccess={() => { setEditAddress(null); qc.invalidateQueries({ queryKey: ['addresses'] }); }}
            onCancel={() => setEditAddress(null)}
          />
        )}
      </GlassModal>
    </div>
  );
}
