import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SpringPage } from '../../types';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data?: T[];
  page?: SpringPage<T>;
  loading?: boolean;
  onPageChange?: (page: number) => void;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
}

const rowDelay = (index: number) => {
  const delays = ['animate-stagger-1','animate-stagger-2','animate-stagger-3','animate-stagger-4','animate-stagger-5','animate-stagger-6','animate-stagger-7','animate-stagger-8'];
  return delays[index] || 'animate-stagger-8';
};

export default function AdminTable<T extends { id: number }>({
  columns, data, page, loading, onPageChange, actions, emptyMessage = 'No data'
}: AdminTableProps<T>) {
  const items = page?.content ?? data ?? [];
  const isEmpty = items.length === 0;

  return (
    <div className="space-y-4">
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {columns.map((col) => (
                  <th key={col.key} className={`text-left px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-widest ${col.className ?? ''}`}>
                    {col.header}
                  </th>
                ))}
                {actions && <th className="text-right px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-widest">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        <div className="skeleton h-4 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : isEmpty ? (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12 text-center text-white/40">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                items.map((item, i) => (
                  <tr key={item.id} className={`hover:bg-white/5 transition-colors duration-200 ${rowDelay(i)}`}>
                    {columns.map((col) => (
                      <td key={col.key} className={`px-4 py-3 text-white/70 ${col.className ?? ''}`}>
                        {col.render(item)}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3 text-right">
                        {actions(item)}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {page && page.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => onPageChange?.(page.number - 1)}
            disabled={page.number === 0}
          >
            <ChevronLeft size={14} /> Prev
          </GlassButton>
          <span className="text-white/50 text-sm">Page {page.number + 1} of {page.totalPages}</span>
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => onPageChange?.(page.number + 1)}
            disabled={page.number >= page.totalPages - 1}
          >
            Next <ChevronRight size={14} />
          </GlassButton>
        </div>
      )}
    </div>
  );
}
