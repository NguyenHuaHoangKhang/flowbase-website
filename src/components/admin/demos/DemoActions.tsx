'use client';

import React, { useState } from 'react';
import { Plus, KeyRound } from 'lucide-react';
import { Button } from '@/components/admin/ui';
import CreateDemoModal from './CreateDemoModal';
import CreateGrantModal from './CreateGrantModal';
import type { UserRole } from '@/lib/types';

interface DemoActionsProps {
  role: UserRole;
}

export default function DemoActions({ role }: DemoActionsProps) {
  const [isCreateDemoOpen, setIsCreateDemoOpen] = useState(false);
  const [isCreateGrantOpen, setIsCreateGrantOpen] = useState(false);

  // VIEWER không có quyền tạo hoặc cấp quyền
  if (role === 'VIEWER') {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        icon={<KeyRound size={15} />}
        onClick={() => setIsCreateGrantOpen(true)}
      >
        Cấp quyền xem
      </Button>

      <Button
        variant="primary"
        icon={<Plus size={15} />}
        onClick={() => setIsCreateDemoOpen(true)}
      >
        Thêm demo
      </Button>

      <CreateDemoModal
        isOpen={isCreateDemoOpen}
        onClose={() => setIsCreateDemoOpen(false)}
      />

      <CreateGrantModal
        isOpen={isCreateGrantOpen}
        onClose={() => setIsCreateGrantOpen(false)}
      />
    </div>
  );
}
