import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CreditCard as Edit2, Trash2, User } from 'lucide-react';
import api from '../../lib/axios';
import type { Artist } from '../../types';
import AdminTable from '../../components/ui/AdminTable';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../store/toastStore';

export default function ArtistList() {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const qc = useQueryClient();
  const { success, error } = useToast();

  const { data: artists, isLoading } = useQuery({
    queryKey: ['artists'],
    queryFn: () => api.get<Artist[]>('/catalog/artists').then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/catalog/artists/${id}`),
    onSuccess: () => { setDeleteId(null); qc.invalidateQueries(); success('Artist deleted'); },
    onError: () => error('Failed to delete artist'),
  });

  const columns = [
    {
      key: 'avatar', header: 'Image', className: 'w-14',
      render: (a: Artist) => (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 flex-shrink-0">
          {a.avatarUrl ? (
            <img src={a.avatarUrl} alt={a.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/15">
              <User size={14} />
            </div>
          )}
        </div>
      ),
    },
    { key: 'name', header: 'Name', render: (a: Artist) => <span className="font-medium text-white">{a.name}</span> },
    { key: 'slug', header: 'Slug', render: (a: Artist) => <span className="font-mono text-white/40 text-xs">{a.slug}</span> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Artists</h1>
        <Link to="/admin/artists/new">
          <GlassButton variant="primary" size="sm">Add Artist</GlassButton>
        </Link>
      </div>

      <AdminTable
        columns={columns}
        data={artists}
        loading={isLoading}
        emptyMessage="No artists yet"
        actions={(a) => (
          <div className="flex items-center gap-2 justify-end">
            <Link to={`/admin/artists/${a.id}/edit`} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
              <Edit2 size={14} />
            </Link>
            <button onClick={() => setDeleteId(a.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      />

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete artist"
        message="Are you sure you want to delete this artist?"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
