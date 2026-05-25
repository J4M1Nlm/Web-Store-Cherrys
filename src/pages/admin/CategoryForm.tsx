import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import type { Category } from '../../types';
import GlassCard from '../../components/ui/GlassCard';
import GlassInput from '../../components/ui/GlassInput';
import GlassButton from '../../components/ui/GlassButton';
import { useToast } from '../../store/toastStore';

interface CategoryDetail {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
}

export default function CategoryForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { success, error } = useToast();
  const isEdit = !!id;

  const [form, setForm] = useState({ name: '', slug: '', parentId: '' });

  const { data: category } = useQuery({
    queryKey: ['category', id],
    queryFn: () => api.get<CategoryDetail>(`/admin/catalog/categories/${id}`).then((r) => r.data),
    enabled: isEdit,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/catalog/categories/tree').then((r) => r.data),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name,
        slug: category.slug,
        parentId: category.parentId ? String(category.parentId) : '',
      });
    }
  }, [category]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        parentId: form.parentId ? Number(form.parentId) : null,
      };
      return isEdit
        ? api.put(`/admin/catalog/categories/${id}`, payload)
        : api.post('/admin/catalog/categories', payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      success(isEdit ? 'Category updated!' : 'Category created!');
      navigate('/admin/categories');
    },
    onError: () => error('Failed to save category'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { error('Name is required'); return; }
    mutation.mutate();
  };

  const flattenCategories = (cats: Category[], result: { id: number; name: string }[] = []): { id: number; name: string }[] => {
    for (const c of cats) {
      if (isEdit && c.id === Number(id)) continue; // Skip self
      result.push({ id: c.id, name: c.name });
      if (c.children) flattenCategories(c.children, result);
    }
    return result;
  };

  const flatCats = categories ? flattenCategories(categories) : [];

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-white mb-6">{isEdit ? 'Edit Category' : 'New Category'}</h1>

      <GlassCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput label="Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Category name" />
          <GlassInput label="Slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="Auto-generated if empty" />
          <div>
            <label className="text-sm font-medium text-white/70 block mb-1.5">Parent category</label>
            <select
              value={form.parentId}
              onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
              className="glass-input px-4 py-3 rounded-xl w-full text-sm"
            >
              <option value="">None (top-level)</option>
              {flatCats.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>

          <div className="flex gap-3 pt-3">
            <GlassButton type="button" variant="ghost" onClick={() => navigate('/admin/categories')}>Cancel</GlassButton>
            <GlassButton type="submit" variant="primary" loading={mutation.isPending}>
              {isEdit ? 'Save' : 'Create'}
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
