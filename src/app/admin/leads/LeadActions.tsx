'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/admin/ui';
import CreateLeadModal from '@/components/admin/leads/CreateLeadModal';
import type { UserRole } from '@/lib/types';

export default function LeadActions({ role }: { role: UserRole }) {
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
        Tạo cơ hội
      </Button>

      <CreateLeadModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
