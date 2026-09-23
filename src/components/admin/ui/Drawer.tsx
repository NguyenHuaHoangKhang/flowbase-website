'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl';

const drawerSizes: Record<DrawerSize, string> = {
  sm: 'max-w-[380px]',
  md: 'max-w-[480px]',
  lg: 'max-w-[640px]',
  xl: 'max-w-[800px]',
};

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  size?: DrawerSize;
  children: React.ReactNode;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  size = 'md',
  children,
  className,
}: DrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/35 backdrop-blur-[3px]"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative z-[101] flex h-full w-full flex-col border-l border-border bg-card shadow-[-10px_0_30px_rgba(0,0,0,0.12)]',
              drawerSizes[size],
              className,
            )}
            role="dialog"
            aria-modal="true"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function DrawerHeader({
  title,
  description,
  onClose,
  children,
  className,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between border-b border-border p-5', className)}>
      <div className="min-w-0 flex-1">
        {title && <h3 className="text-lg font-bold text-ink">{title}</h3>}
        {description && <p className="mt-1 text-xs text-muted">{description}</p>}
        {children}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="ml-3 flex h-8 w-8 flex-none items-center justify-center rounded-lg text-muted transition-colors hover:bg-[#F3F4F6] hover:text-ink"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export function DrawerBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex-1 overflow-y-auto p-5', className)}>
      {children}
    </div>
  );
}

export function DrawerFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-end gap-3 border-t border-border bg-[#FAFAFC] px-5 py-4', className)}>
      {children}
    </div>
  );
}
