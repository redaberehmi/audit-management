'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const toast = (e as CustomEvent).detail as Toast;
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };

    window.addEventListener('toast', handler);
    return () => window.removeEventListener('toast', handler);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 p-4 rounded-xl shadow-lg border animate-in slide-in-from-right-full',
            toast.variant === 'destructive'
              ? 'bg-red-50 border-red-200'
              : 'bg-white border-gray-200',
          )}
        >
          {toast.variant === 'destructive' ? (
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            {toast.title && (
              <p className={cn('text-sm font-semibold', toast.variant === 'destructive' ? 'text-red-800' : 'text-gray-900')}>
                {toast.title}
              </p>
            )}
            {toast.description && (
              <p className={cn('text-xs mt-0.5', toast.variant === 'destructive' ? 'text-red-600' : 'text-gray-500')}>
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
