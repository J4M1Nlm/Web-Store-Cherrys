import GlassModal from './GlassModal';
import GlassButton from './GlassButton';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}

export default function ConfirmModal({
  open, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading
}: ConfirmModalProps) {
  return (
    <GlassModal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-white/60 text-sm mb-5">{message}</p>
      <div className="flex gap-3">
        <GlassButton variant="ghost" className="flex-1" onClick={onClose} disabled={loading}>Cancel</GlassButton>
        <GlassButton variant="danger" className="flex-1" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </GlassButton>
      </div>
    </GlassModal>
  );
}
