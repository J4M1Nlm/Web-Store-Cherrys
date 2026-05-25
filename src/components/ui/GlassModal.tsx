import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface GlassModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function GlassModal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: GlassModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative glass-card w-full ${maxWidth} p-6 animate-slide-up`}>
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white">
              <X size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
