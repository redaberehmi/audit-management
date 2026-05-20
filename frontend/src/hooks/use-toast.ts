import { useState, useCallback } from 'react';

type ToastVariant = 'default' | 'destructive';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

let toastCount = 0;

// Simplified toast hook
export function useToast() {
  const toast = useCallback(({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const event = new CustomEvent('toast', { detail: { id: String(++toastCount), title, description, variant } });
    window.dispatchEvent(event);
  }, []);

  return { toast };
}
