import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColors = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`${bgColors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}
      >
        <p className="flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
