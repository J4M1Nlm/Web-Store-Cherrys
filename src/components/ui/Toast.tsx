import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto glass-card px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-sm animate-slide-up shadow-lg hover:border-white/20 transition-all"
        >
          {toast.type === 'success' && <CheckCircle size={18} className="text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle size={18} className="text-red-400 shrink-0" />}
          {toast.type === 'info' && <Info size={18} className="text-blue-400 shrink-0" />}
          <p className="text-sm text-white/90 flex-1">{toast.message}</p>
          <button onClick={() => removeToast(toast.id)} className="text-white/40 hover:text-white/80 transition-colors">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
