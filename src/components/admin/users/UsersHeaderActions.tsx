'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/admin/ui';
import CreateUserModal from './CreateUserModal';

export default function UsersHeaderActions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setIsOpen(true)}>
        <UserPlus size={15} className="mr-1.5" />
        Mời thành viên
      </Button>

      <CreateUserModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
