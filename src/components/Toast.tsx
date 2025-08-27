import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Toast as ToastType } from '@/hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

export const Toast = ({ toast, onRemove }: ToastProps) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-toast-success" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-toast-error" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-journal-card border-toast-success/30';
      case 'error':
        return 'bg-journal-card border-toast-error/30';
      case 'info':
        return 'bg-journal-card border-blue-400/30';
    }
  };

  return (
    <div
      className={`
        flex items-center gap-3 p-4 rounded-xl border backdrop-blur-sm
        shadow-lg animate-in slide-in-from-right-full duration-300
        ${getBgColor()}
      `}
      role="alert"
      aria-live="polite"
    >
      {getIcon()}
      <p className="text-sm font-medium text-foreground flex-1">
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Tutup notifikasi"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};