'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/admin/ui';
import CreateProjectModal from './CreateProjectModal';
import type { UserRole } from '@/lib/types';

export default function ProjectActions({ role }: { role: UserRole }) {
  const [isOpen, setIsOpen] = useState(false);

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
        Tạo dự án
      </Button>

      <CreateProjectModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
