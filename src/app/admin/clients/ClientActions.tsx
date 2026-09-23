'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/admin/ui';
import CreateClientModal from '@/components/admin/clients/CreateClientModal';
import type { UserRole } from '@/lib/types';

export default function ClientActions({ role }: { role: UserRole }) {
  const [isOpen, setIsOpen] = useState(false);

  // Người dùng VIEWER chỉ có quyền đọc, không thể tạo mới
  if (role === 'VIEWER') {
    return null;
  }

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setIsOpen(true)}
        icon={<Plus size={16} />}
      >
        Thêm khách hàng
      </Button>

      <CreateClientModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
