'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<ModalSize, string> = {
  sm: 'max-w-[420px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[760px]',
  xl: 'max-w-[980px]',
};

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  children: React.ReactNode;
  className?: string;
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
  draggable?: boolean;
  noBackdrop?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  size = 'md',
  children,
  className,
  closeOnEsc = true,
  closeOnBackdrop = true,
  draggable = false,
  noBackdrop = false,
}: ModalProps) {
  // Khoá scroll của body khi modal mở (nếu có backdrop)
  useEffect(() => {
    if (!isOpen) return;
    
    let originalStyle = '';
    if (!noBackdrop) {
      originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (!noBackdrop) {
        document.body.style.overflow = originalStyle;
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEsc, onClose, noBackdrop]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div 
          className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6",
            noBackdrop ? "pointer-events-none" : ""
          )}
        >
          {/* Backdrop mờ */}
          {!noBackdrop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={closeOnBackdrop ? onClose : undefined}
              className="fixed inset-0 bg-ink/40 backdrop-blur-[4px] pointer-events-auto"
              aria-hidden="true"
            />
          )}

          {/* Modal Panel */}
          <motion.div
            drag={draggable}
            dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }} // Very loose constraints
            dragElastic={0}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative flex w-full flex-col overflow-hidden rounded-[16px] border border-border bg-card shadow-[0_20px_50px_rgba(0,0,0,0.18)] pointer-events-auto',
              sizeMap[size],
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

// ---------------------------------------------------------------------------
// Modal Subcomponents: Header, Body, Footer
// ---------------------------------------------------------------------------
export function ModalHeader({
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
    <div className={cn('flex items-start justify-between border-b border-border p-5 sm:p-6', className)}>
      <div className="min-w-0 flex-1">
        {title && <h3 className="text-lg font-bold tracking-tight text-ink">{title}</h3>}
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
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

export function ModalBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('max-h-[75vh] overflow-y-auto p-5 sm:p-6', className)}>
      {children}
    </div>
  );
}

export function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-end gap-3 border-t border-border bg-[#FAFAFC] px-5 py-4 sm:px-6', className)}>
      {children}
    </div>
  );
}
