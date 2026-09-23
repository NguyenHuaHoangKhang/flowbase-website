'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const toastObj = {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
    info: (msg: string) => addToast('info', msg),
  };

  return (
    <ToastContext.Provider value={{ toast: toastObj }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-center gap-3 min-w-[280px] rounded-xl border p-4 shadow-xl animate-in slide-in-from-right-8 fade-in bg-card",
              t.type === 'success' && 'border-success/30 bg-success/[0.03]',
              t.type === 'error' && 'border-danger/30 bg-danger/[0.03]',
              t.type === 'info' && 'border-primary/30 bg-primary/[0.03]'
            )}
          >
            {t.type === 'success' && <CheckCircle2 size={20} className="text-success" />}
            {t.type === 'error' && <XCircle size={20} className="text-danger" />}
            {t.type === 'info' && <Info size={20} className="text-primary" />}
            <span className="text-sm font-semibold text-ink flex-1">{t.message}</span>
            <button 
              onClick={() => setToasts(p => p.filter(x => x.id !== t.id))} 
              className="flex-none text-muted hover:text-ink transition-colors p-1 rounded-md hover:bg-white/5"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
