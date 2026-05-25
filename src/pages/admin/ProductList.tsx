import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard as Edit2, Trash2, Check, X, Layers, Image, Square } from 'lucide-react';
import api from '../../lib/axios';
import type { SpringPage, ProductListItem } from '../../types';
import { formatPrice } from '../../lib/format';
import AdminTable from '../../components/ui/AdminTable';
import GlassButton from '../../components/ui/GlassButton';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../store/toastStore';

interface AdminProduct extends ProductListItem {
  artistName?: string;
  categoryName?: string;
}

export default function ProductList() {
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const qc = useQueryClient();
  const { success, error } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page],
    queryFn: () => api.get<SpringPage<AdminProduct>>('/admin/catalog/products', { params: { page, size: 15 } }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => api.put(`/admin/catalog/products/${id}/active`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); success('Product updated'); },
    onError: () => error('Failed to update product'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/catalog/products/${id}`),
    onSuccess: () => { setDeleteId(null); qc.invalidateQueries({ queryKey: ['admin-products'] }); success('Product deleted'); },
    onError: () => error('Failed to delete product'),
  });

  const columns = [
    {
      key: 'image', header: 'Image', className: 'w-14',
      render: (p: AdminProduct) => (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
          {p.mainImageUrl ? <img src={p.mainImageUrl} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/10 text-xs">CT</div>}
        </div>
      ),
    },
    { key: 'name', header: 'Name', render: (p: AdminProduct) => <span className="font-medium text-white">{p.name}</span> },
    { key: 'artist', header: 'Artist', render: (p: AdminProduct) => <span className="text-white/50">{p.artistName ?? p.artistSlug ?? '-'}</span> },
    { key: 'category', header: 'Category', render: (p: AdminProduct) => <span className="text-white/50">{p.categoryName ?? p.categorySlug ?? '-'}</span> },
    { key: 'price', header: 'Price', render: (p: AdminProduct) => <span className="text-cherry font-medium">{formatPrice(p.basePriceCents, p.currency)}</span> },
    {
      key: 'active', header: 'Active', render: (p: AdminProduct) => (
        <button
          onClick={() => toggleMutation.mutate(p.id)}
          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
            p.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/30'
          }`}
        >
          {p.active ? <Check size={12} /> : <X size={12} />}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Products</h1>
        <Link to="/admin/products/new">
          <GlassButton variant="primary" size="sm">Add Product</GlassButton>
        </Link>
      </div>

      <AdminTable
        columns={columns}
        page={data}
        loading={isLoading}
        onPageChange={setPage}
        actions={(p) => (
          <div className="flex items-center gap-2 justify-end">
            <Link to={`/admin/products/${p.id}/variants`} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors" title="Variants">
              <Layers size={14} />
            </Link>
            <Link to={`/admin/products/${p.id}/images`} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors" title="Images">
              <Image size={14} />
            </Link>
            <Link to={`/admin/products/${p.id}/edit`} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors" title="Edit">
              <Edit2 size={14} />
            </Link>
            <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors" title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      />

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
