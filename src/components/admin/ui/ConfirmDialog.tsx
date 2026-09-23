'use client';

import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from './Modal';
import { Button } from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  tone?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  tone = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const iconMap = {
    danger: <AlertTriangle className="text-[#EF4444]" size={22} />,
    warning: <AlertTriangle className="text-[#F59E0B]" size={22} />,
    info: <Info className="text-primary" size={22} />,
  };

  const bgMap = {
    danger: 'bg-[#EF4444]/10 border-[#EF4444]/20',
    warning: 'bg-[#F59E0B]/10 border-[#F59E0B]/20',
    info: 'bg-primary/10 border-primary/20',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalBody className="p-6">
        <div className="flex gap-4">
          <div className={`flex h-11 w-11 flex-none items-center justify-center rounded-xl border ${bgMap[tone]}`}>
            {iconMap[tone]}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[16px] font-bold text-ink">{title}</h3>
            <p className="mt-1.5 text-sm text-muted leading-relaxed">{description}</p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter className="bg-transparent border-t border-border px-6 py-4">
        <Button variant="ghost" onClick={onClose} disabled={loading} size="md">
          {cancelText}
        </Button>
        <Button
          variant={tone === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={loading}
          size="md"
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
