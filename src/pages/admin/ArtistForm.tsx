import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import type { Artist } from '../../types';
import GlassCard from '../../components/ui/GlassCard';
import GlassInput from '../../components/ui/GlassInput';
import GlassButton from '../../components/ui/GlassButton';
import { useToast } from '../../store/toastStore';

export default function ArtistForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { success, error } = useToast();
  const isEdit = !!id;

  const [form, setForm] = useState({ name: '', slug: '', bio: '', imageUrl: '' });

  const { data } = useQuery({
    queryKey: ['artist', id],
    queryFn: () => api.get<Artist>(`/catalog/artists`).then((r) => r.data.find((a) => a.id === Number(id))),
    enabled: isEdit,
  });

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name,
        slug: data.slug,
        bio: data.bio ?? '',
        imageUrl: data.avatarUrl ?? '',
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        bio: form.bio || null,
        imageUrl: form.imageUrl || null,
      };
      return isEdit
        ? api.put(`/admin/catalog/artists/${id}`, payload)
        : api.post('/admin/catalog/artists', payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['artists'] });
      success(isEdit ? 'Artist updated!' : 'Artist created!');
      navigate('/admin/artists');
    },
    onError: () => error('Failed to save artist'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { error('Name is required'); return; }
    mutation.mutate();
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-white mb-6">{isEdit ? 'Edit Artist' : 'New Artist'}</h1>

      <GlassCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput label="Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Artist name" />
          <GlassInput label="Slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="Auto-generated if empty" />

          <div>
            <label className="text-sm font-medium text-white/70 block mb-1.5">Bio (optional)</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Artist biography..."
              className="glass-input px-4 py-3 rounded-xl w-full text-sm h-24 resize-none"
            />
          </div>

          <GlassInput label="Avatar URL (optional)" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />

          <div className="flex gap-3 pt-3">
            <GlassButton type="button" variant="ghost" onClick={() => navigate('/admin/artists')}>Cancel</GlassButton>
            <GlassButton type="submit" variant="primary" loading={mutation.isPending}>
              {isEdit ? 'Save' : 'Create'}
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
