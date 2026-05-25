import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../lib/axios';
import type { SpringPage, ProductListItem, Category, Artist } from '../types';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import GlassInput from '../components/ui/GlassInput';
import GlassButton from '../components/ui/GlassButton';

interface Filters {
  q: string;
  categorySlug: string;
  artistSlug: string;
  minPriceCents: string;
  maxPriceCents: string;
}

const defaultFilters: Filters = { q: '', categorySlug: '', artistSlug: '', minPriceCents: '', maxPriceCents: '' };

export default function Products() {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(defaultFilters);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, appliedFilters],
    queryFn: () => {
      const params: Record<string, string | number> = { page, size: 20 };
      if (appliedFilters.q) params.q = appliedFilters.q;
      if (appliedFilters.categorySlug) params.category = appliedFilters.categorySlug;
      if (appliedFilters.artistSlug) params.artist = appliedFilters.artistSlug;
      if (appliedFilters.minPriceCents) params.minPriceCents = appliedFilters.minPriceCents;
      if (appliedFilters.maxPriceCents) params.maxPriceCents = appliedFilters.maxPriceCents;
      return api.get<SpringPage<ProductListItem>>('/catalog/products', { params }).then((r) => r.data);
    },
    placeholderData: (prev) => prev,
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

  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
    setPage(0);
    setSidebarOpen(false);
  }, [filters]);

  const clearFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(0);
  };

  const hasActiveFilters = Object.values(appliedFilters).some(Boolean);

  return (
    <div className="gradient-bg min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Shop</h1>
          {data && (
            <p className="text-white/40 text-sm">{data.totalElements} products</p>
          )}
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className={`
            fixed inset-y-0 left-0 z-30 w-72 glass-card rounded-none border-r border-white/10 p-6 overflow-y-auto transition-transform duration-300
            md:static md:block md:w-64 md:flex-shrink-0 md:rounded-2xl md:translate-x-0 md:h-fit md:sticky md:top-24
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-white text-sm uppercase tracking-widest">Filters</h2>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-cherry hover:text-cherry/80 transition-colors">Clear all</button>
                )}
                <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/50 hover:text-white">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <GlassInput
                  placeholder="Search products..."
                  value={filters.q}
                  onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                />
              </div>

              {categories && categories.length > 0 && (
                <FilterSection title="Category">
                  <div className="flex flex-wrap gap-2">
                    <PillButton
                      active={!filters.categorySlug}
                      onClick={() => setFilters((f) => ({ ...f, categorySlug: '' }))}
                    >All</PillButton>
                    {categories.map((cat) => (
                      <PillButton
                        key={cat.id}
                        active={filters.categorySlug === cat.slug}
                        onClick={() => setFilters((f) => ({ ...f, categorySlug: cat.slug }))}
                      >{cat.name}</PillButton>
                    ))}
                  </div>
                </FilterSection>
              )}

              {artists && artists.length > 0 && (
                <FilterSection title="Artist">
                  <div className="flex flex-wrap gap-2">
                    <PillButton
                      active={!filters.artistSlug}
                      onClick={() => setFilters((f) => ({ ...f, artistSlug: '' }))}
                    >All</PillButton>
                    {artists.map((a) => (
                      <PillButton
                        key={a.id}
                        active={filters.artistSlug === a.slug}
                        onClick={() => setFilters((f) => ({ ...f, artistSlug: a.slug }))}
                      >{a.name}</PillButton>
                    ))}
                  </div>
                </FilterSection>
              )}

              <FilterSection title="Price Range (MXN)">
                <div className="flex gap-2">
                  <GlassInput
                    placeholder="Min"
                    type="number"
                    value={filters.minPriceCents ? String(Number(filters.minPriceCents) / 100) : ''}
                    onChange={(e) => setFilters((f) => ({ ...f, minPriceCents: e.target.value ? String(Number(e.target.value) * 100) : '' }))}
                    className="text-xs"
                  />
                  <GlassInput
                    placeholder="Max"
                    type="number"
                    value={filters.maxPriceCents ? String(Number(filters.maxPriceCents) / 100) : ''}
                    onChange={(e) => setFilters((f) => ({ ...f, maxPriceCents: e.target.value ? String(Number(e.target.value) * 100) : '' }))}
                    className="text-xs"
                  />
                </div>
              </FilterSection>

              <GlassButton variant="primary" className="w-full" onClick={applyFilters}>
                Apply Filters
              </GlassButton>
            </div>
          </aside>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-20 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Products */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden flex items-center gap-2 btn-ghost px-4 py-2 rounded-xl text-sm"
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>
              {hasActiveFilters && (
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-xs text-white/40">Active filters:</span>
                  {appliedFilters.q && <FilterTag label={`"${appliedFilters.q}"`} onRemove={() => { setAppliedFilters(f => ({ ...f, q: '' })); setFilters(f => ({ ...f, q: '' })); }} />}
                  {appliedFilters.categorySlug && <FilterTag label={appliedFilters.categorySlug} onRemove={() => { setAppliedFilters(f => ({ ...f, categorySlug: '' })); setFilters(f => ({ ...f, categorySlug: '' })); }} />}
                  {appliedFilters.artistSlug && <FilterTag label={appliedFilters.artistSlug} onRemove={() => { setAppliedFilters(f => ({ ...f, artistSlug: '' })); setFilters(f => ({ ...f, artistSlug: '' })); }} />}
                </div>
              )}
            </div>

            {isLoading ? (
              <ProductGridSkeleton count={12} />
            ) : data?.content.length === 0 ? (
              <div className="glass-card p-16 text-center">
                <Search size={40} className="text-white/20 mx-auto mb-4" />
                <p className="text-white/40 text-lg">No products found</p>
                <p className="text-white/25 text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {data?.content.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {data && data.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-10">
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 0}
                    >
                      <ChevronLeft size={16} />
                      Prev
                    </GlassButton>
                    <span className="text-white/50 text-sm">
                      Page {data.number + 1} of {data.totalPages}
                    </span>
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= data.totalPages - 1}
                    >
                      Next
                      <ChevronRight size={16} />
                    </GlassButton>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-medium text-white/40 uppercase tracking-widest mb-3">{title}</h3>
      {children}
    </div>
  );
}

function PillButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
        active
          ? 'bg-cherry text-white shadow-[0_0_12px_rgba(232,41,76,0.4)]'
          : 'bg-white/7 text-white/60 hover:bg-white/12 hover:text-white border border-white/10'
      }`}
    >
      {children}
    </button>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-cherry/20 text-cherry text-xs px-2.5 py-1 rounded-full border border-cherry/30">
      {label}
      <button onClick={onRemove}><X size={10} /></button>
    </span>
  );
}
