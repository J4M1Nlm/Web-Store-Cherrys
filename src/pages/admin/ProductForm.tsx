import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import type { Category, Artist } from '../../types';
import GlassCard from '../../components/ui/GlassCard';
import GlassInput from '../../components/ui/GlassInput';
import GlassButton from '../../components/ui/GlassButton';
import { useToast } from '../../store/toastStore';

interface ProductFormData {
  name: string;
  description: string;
  basePricePesos: string;
  currency: string;
  artistId: string;
  categoryId: string;
}

interface ProductDetail {
  id: number;
  name: string;
  description: string | null;
  basePriceCents: number;
  currency: string;
  artist: { id: number; name: string; slug: string } | null;
  category: { id: number; name: string; slug: string } | null;
}

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { success, error } = useToast();
  const isEdit = !!id;

  const [form, setForm] = useState<ProductFormData>({
    name: '',
    description: '',
    basePricePesos: '',
    currency: 'MXN',
    artistId: '',
    categoryId: '',
  });

  const { data: product } = useQuery({
    queryKey: ['product-detail-admin', id],
    queryFn: () => api.get<ProductDetail>(`/admin/catalog/products/${id}`).then((r) => r.data),
    enabled: isEdit,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/catalog/categories/tree').then((r) => r.data),
    staleTime: Infinity,
  });

  const { data: artists } = useQuery({
    queryKey: ['artists'],
    queryFn: () => api.get<Artist[]>('/catalog/artists').then((r) => r.data),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description ?? '',
        basePricePesos: String(product.basePriceCents / 100),
        currency: product.currency || 'MXN',
        artistId: product.artist ? String(product.artist.id) : '',
        categoryId: product.category ? String(product.category.id) : '',
      });
    }
  }, [product]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        description: form.description || null,
        basePriceCents: Math.round(Number(form.basePricePesos) * 100),
        currency: form.currency,
        artistId: form.artistId ? Number(form.artistId) : null,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
      };
      return isEdit
        ? api.put(`/admin/catalog/products/${id}`, payload)
        : api.post('/admin/catalog/products', payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      success(isEdit ? 'Product updated!' : 'Product created!');
      navigate('/admin/products');
    },
    onError: () => error('Failed to save product'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.basePricePesos) { error('Please fill in required fields'); return; }
    mutation.mutate();
  };

  const set = (field: keyof ProductFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-white mb-6">{isEdit ? 'Edit Product' : 'New Product'}</h1>

      <GlassCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput label="Name *" value={form.name} onChange={set('name')} placeholder="Product name" />

          <div>
            <label className="text-sm font-medium text-white/70 block mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Product description..."
              className="glass-input px-4 py-3 rounded-xl w-full text-sm h-28 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <GlassInput label="Price (MXN) *" type="number" step="0.01" value={form.basePricePesos} onChange={set('basePricePesos')} placeholder="0.00" />
            <div>
              <label className="text-sm font-medium text-white/70 block mb-1.5">Currency</label>
              <select value={form.currency} onChange={set('currency')} className="glass-input px-4 py-3 rounded-xl w-full text-sm">
                <option value="MXN">MXN</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-white/70 block mb-1.5">Artist</label>
              <select value={form.artistId} onChange={set('artistId')} className="glass-input px-4 py-3 rounded-xl w-full text-sm">
                <option value="">Select artist</option>
                {artists?.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-white/70 block mb-1.5">Category</label>
              <select value={form.categoryId} onChange={set('categoryId')} className="glass-input px-4 py-3 rounded-xl w-full text-sm">
                <option value="">Select category</option>
                {categories?.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <GlassButton type="button" variant="ghost" onClick={() => navigate('/admin/products')}>Cancel</GlassButton>
            <GlassButton type="submit" variant="primary" loading={mutation.isPending}>
              {isEdit ? 'Save Changes' : 'Create Product'}
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
