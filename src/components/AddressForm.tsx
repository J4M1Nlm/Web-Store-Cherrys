import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/axios';
import type { Address } from '../types';
import GlassInput from './ui/GlassInput';
import GlassButton from './ui/GlassButton';
import { useToast } from '../store/toastStore';

interface AddressFormProps {
  address?: Address;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
  const { success, error } = useToast();
  const [form, setForm] = useState({
    recipientName: address?.recipientName ?? '',
    label: address?.label ?? '',
    line1: address?.line1 ?? '',
    line2: address?.line2 ?? '',
    city: address?.city ?? '',
    state: address?.state ?? '',
    postalCode: address?.postalCode ?? '',
    country: address?.country ?? 'MX',
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const mutation = useMutation({
    mutationFn: () => address
      ? api.put<Address>(`/users/addresses/${address.id}`, form).then((r) => r.data)
      : api.post<Address>('/users/addresses', form).then((r) => r.data),
    onSuccess: () => { success(address ? 'Address updated!' : 'Address added!'); onSuccess(); },
    onError: () => error('Failed to save address'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.line1 || !form.city || !form.country) { error('Please fill in required fields'); return; }
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <GlassInput label="Recipient name" value={form.recipientName} onChange={set('recipientName')} placeholder="Full name" />
        <GlassInput label="Label (optional)" value={form.label} onChange={set('label')} placeholder="Home, Work..." />
      </div>
      <GlassInput label="Address line 1 *" value={form.line1} onChange={set('line1')} placeholder="Street address" />
      <GlassInput label="Address line 2" value={form.line2} onChange={set('line2')} placeholder="Apt, suite..." />
      <div className="grid grid-cols-2 gap-3">
        <GlassInput label="City *" value={form.city} onChange={set('city')} placeholder="City" />
        <GlassInput label="State" value={form.state} onChange={set('state')} placeholder="State" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <GlassInput label="Postal code" value={form.postalCode} onChange={set('postalCode')} placeholder="ZIP" />
        <GlassInput label="Country *" value={form.country} onChange={set('country')} placeholder="MX" />
      </div>
      <div className="flex gap-3 pt-2">
        <GlassButton type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</GlassButton>
        <GlassButton type="submit" variant="primary" loading={mutation.isPending} className="flex-1">
          {address ? 'Update' : 'Add Address'}
        </GlassButton>
      </div>
    </form>
  );
}
