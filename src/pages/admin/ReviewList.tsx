import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Check, X, Trash2 } from 'lucide-react';
import api from '../../lib/axios';
import type { SpringPage } from '../../types';
import AdminTable from '../../components/ui/AdminTable';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../store/toastStore';

interface Review {
  id: number;
  productId: number;
  productName: string;
  userId: number;
  userName: string;
  rating: number;
  comment: string | null;
  isPublic: boolean;
  createdAt: string;
}

export default function ReviewList() {
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const qc = useQueryClient();
  const { success, error } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', page],
    queryFn: () => api.get<SpringPage<Review>>('/admin/reviews', { params: { page, size: 20 } }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => api.put(`/admin/reviews/${id}/public`),
    onSuccess: () => { qc.invalidateQueries(); success('Visibility updated'); },
    onError: () => error('Failed to update visibility'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/reviews/${id}`),
    onSuccess: () => { setDeleteId(null); qc.invalidateQueries(); success('Review deleted'); },
    onError: () => error('Failed to delete review'),
  });

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={12} className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'} />
      ))}
    </div>
  );

  const columns = [
    { key: 'product', header: 'Product', render: (r: Review) => <span className="text-white/70">{r.productName}</span> },
    { key: 'user', header: 'User', render: (r: Review) => <span className="text-white/50">{r.userName}</span> },
    { key: 'rating', header: 'Rating', render: (r: Review) => renderStars(r.rating) },
    { key: 'comment', header: 'Comment', render: (r: Review) => <span className="text-white/40 line-clamp-2 max-w-[200px]">{r.comment ?? '-'}</span> },
    { key: 'public', header: 'Public', render: (r: Review) => (
      <button
        onClick={() => toggleMutation.mutate(r.id)}
        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
          r.isPublic ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/30'
        }`}
      >
        {r.isPublic ? <Check size={12} /> : <X size={12} />}
      </button>
    )},
    { key: 'date', header: 'Date', render: (r: Review) => <span className="text-white/30 text-xs">{new Date(r.createdAt).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-white">Reviews</h1>

      <AdminTable
        columns={columns}
        page={data}
        loading={isLoading}
        onPageChange={setPage}
        actions={(r) => (
          <button
            onClick={() => setDeleteId(r.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      />

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete review"
        message="Are you sure you want to delete this review?"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
