import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, ChevronLeft, Image as ImageIcon } from 'lucide-react';
import api from '../../lib/axios';
import type { ProductDetail } from '../../types';
import GlassCard from '../../components/ui/GlassCard';
import GlassInput from '../../components/ui/GlassInput';
import GlassButton from '../../components/ui/GlassButton';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../store/toastStore';

interface ProductImage {
  id: number;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export default function ProductImages() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { success, error } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ url: '', altText: '', sortOrder: '0' });

  const { data: product } = useQuery({
    queryKey: ['product-detail', id],
    queryFn: () => api.get<ProductDetail>(`/admin/catalog/products/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const { data: images } = useQuery({
    queryKey: ['product-images', id],
    queryFn: () => api.get<ProductImage[]>(`/admin/catalog/products/${id}/images`).then((r) => r.data),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: () => api.post(`/admin/catalog/products/${id}/images`, {
      url: form.url,
      altText: form.altText || null,
      sortOrder: Number(form.sortOrder) || 0,
    }),
    onSuccess: () => { qc.invalidateQueries(); resetForm(); success('Image added'); },
    onError: () => error('Failed to add image'),
  });

  const deleteMutation = useMutation({
    mutationFn: (imageId: number) => api.delete(`/admin/catalog/products/${id}/images/${imageId}`),
    onSuccess: () => { setDeleteId(null); qc.invalidateQueries(); success('Image deleted'); },
    onError: () => error('Failed to delete image'),
  });

  const resetForm = () => {
    setShowForm(false);
    setForm({ url: '', altText: '', sortOrder: '0' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url) { error('Image URL is required'); return; }
    createMutation.mutate();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 mb-4">
        <Link to="/admin/products" className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Images</h1>
          <p className="text-white/40 text-sm">{product?.name}</p>
        </div>
      </div>

      {!showForm && (
        <GlassButton variant="primary" size="sm" onClick={() => setShowForm(true)}>
          <Plus size={14} /> Add Image
        </GlassButton>
      )}

      {showForm && (
        <GlassCard className="p-5">
          <h2 className="font-semibold text-white mb-4">New Image</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <GlassInput label="Image URL *" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://..." />
            <GlassInput label="Alt text" value={form.altText} onChange={(e) => setForm((f) => ({ ...f, altText: e.target.value }))} placeholder="Description for accessibility" />
            <GlassInput label="Sort order" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} placeholder="0" />

            <div className="flex gap-3 pt-2">
              <GlassButton type="button" variant="ghost" onClick={resetForm}>Cancel</GlassButton>
              <GlassButton type="submit" variant="primary" loading={createMutation.isPending}>Add</GlassButton>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images?.sort((a, b) => a.sortOrder - b.sortOrder).map((img) => (
          <GlassCard key={img.id} className="p-3 group">
            <div className="aspect-square rounded-xl overflow-hidden bg-white/5 mb-3 relative">
              <img src={img.url} alt={img.altText ?? ''} className="w-full h-full object-cover" />
              <button
                onClick={() => setDeleteId(img.id)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white/60 hover:text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={12} />
              </button>
            </div>
            {img.altText && <p className="text-xs text-white/50 truncate">{img.altText}</p>}
            <p className="text-xs text-white/30">Sort: {img.sortOrder}</p>
          </GlassCard>
        ))}
      </div>

      {images?.length === 0 && (
        <GlassCard className="p-12 text-center">
          <ImageIcon size={40} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/40">No images yet</p>
        </GlassCard>
      )}

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete image"
        message="Are you sure you want to delete this image?"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
