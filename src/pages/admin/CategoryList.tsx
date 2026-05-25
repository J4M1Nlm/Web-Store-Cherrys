import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CreditCard as Edit2, Trash2, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';
import type { Category } from '../../types';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../store/toastStore';

export default function CategoryList() {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const qc = useQueryClient();
  const { success, error } = useToast();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/catalog/categories/tree').then((r) => r.data),
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/catalog/categories/${id}`),
    onSuccess: () => { setDeleteId(null); qc.invalidateQueries(); success('Category deleted'); },
    onError: () => error('Failed to delete category'),
  });

  const renderTree = (cats: Category[], level = 0) => (
    <div className="space-y-1">
      {cats.map((cat) => (
        <div key={cat.id}>
          <div
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors ${level > 0 ? 'ml-6' : ''}`}
          >
            <div className="flex items-center gap-3">
              {cat.children && cat.children.length > 0 && <ChevronRight size={14} className="text-white/30" />}
              <span className="text-sm font-medium text-white">{cat.name}</span>
              <span className="text-xs text-white/30 font-mono">{cat.slug}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={`/admin/categories/${cat.id}/edit`}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <Edit2 size={13} />
              </Link>
              <button
                onClick={() => setDeleteId(cat.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          {cat.children && cat.children.length > 0 && renderTree(cat.children, level + 1)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Categories</h1>
        <Link to="/admin/categories/new">
          <GlassButton variant="primary" size="sm">Add Category</GlassButton>
        </Link>
      </div>

      <GlassCard className="p-4">
        {categories && categories.length > 0 ? (
          renderTree(categories)
        ) : (
          <p className="text-white/40 text-center py-8">No categories yet</p>
        )}
      </GlassCard>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete category"
        message="Are you sure you want to delete this category? Children will be orphaned."
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
