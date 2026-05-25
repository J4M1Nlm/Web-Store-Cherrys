import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User as UserIcon } from 'lucide-react';
import api from '../../lib/axios';
import type { User } from '../../types';
import GlassInput from '../../components/ui/GlassInput';
import GlassButton from '../../components/ui/GlassButton';
import GlassCard from '../../components/ui/GlassCard';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../store/toastStore';

export default function Profile() {
  const { setUser } = useAuthStore();
  const { success, error } = useToast();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<User>('/users/me').then((r) => r.data),
    onSuccess: (data: User) => setUser(data),
  } as Parameters<typeof useQuery>[0]);

  const [form, setForm] = useState({ fullName: '', phone: '' });
  useEffect(() => {
    if (user) setForm({ fullName: user.fullName, phone: user.phone ?? '' });
  }, [user]);

  const mutation = useMutation({
    mutationFn: () => api.put<User>('/users/me', form).then((r) => r.data),
    onSuccess: (data) => { setUser(data); success('Profile updated!'); },
    onError: () => error('Failed to update profile'),
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-cherry/20 rounded-full flex items-center justify-center">
          <UserIcon size={20} className="text-cherry" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Profile</h1>
          <p className="text-white/40 text-sm">{user?.email}</p>
        </div>
      </div>

      <GlassCard className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest">Email</label>
            <p className="text-sm text-white/60 mt-1 font-mono">{user?.email}</p>
          </div>

          <GlassInput
            label="Full name"
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          />

          <GlassInput
            label="Phone (optional)"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+52 55 1234 5678"
          />

          <div className="flex items-center gap-4 text-sm text-white/40 pt-2 border-t border-white/10">
            <span>Role: <span className="text-white/60">{user?.role}</span></span>
            <span>Email verified: <span className={user?.emailVerified ? 'text-emerald-400' : 'text-amber-400'}>{user?.emailVerified ? 'Yes' : 'No'}</span></span>
          </div>

          <GlassButton
            variant="primary"
            onClick={() => mutation.mutate()}
            loading={mutation.isPending}
          >
            Save Changes
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
}
