'use client';

import { Button } from '@/components/admin/ui';
import { Plus } from 'lucide-react';
import { canAccess } from '@/lib/rbac';
import type { UserRole } from '@/lib/types';

export default function PromptActions({ role }: { role: UserRole }) {
  if (!canAccess(role, 'prompt' as any)) return null;

  return (
    <div className="flex items-center gap-3">
      <Button href="/admin/prompts/new" variant="primary" icon={<Plus size={16} />}>
        Tạo prompt
      </Button>
    </div>
  );
}
