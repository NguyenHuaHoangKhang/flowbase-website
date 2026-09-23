'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/admin/ui';
import CreateExpenseModal from './CreateExpenseModal';
import type { UserRole } from '@/lib/types';

export default function ExpenseActions({ role }: { role: UserRole }) {
  const [isOpen, setIsOpen] = useState(false);

  // Chỉ OWNER và ADMIN mới có quyền tạo chi phí
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
        Thêm chi phí
      </Button>

      <CreateExpenseModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
