'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/admin/ui';
import CreateInvoiceModal from './CreateInvoiceModal';
import type { UserRole } from '@/lib/types';

export default function InvoiceActions({ role }: { role: UserRole }) {
  const [isOpen, setIsOpen] = useState(false);

  // Chỉ OWNER và ADMIN mới có quyền tạo hoá đơn
  if (role !== 'OWNER' && role !== 'ADMIN') {
    return null;
  }

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setIsOpen(true)}
        icon={<Plus size={16} />}
      >
        Tạo hoá đơn
      </Button>

      <CreateInvoiceModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
