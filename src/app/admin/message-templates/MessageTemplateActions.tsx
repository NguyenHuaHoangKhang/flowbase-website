'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, useToast } from '@/components/admin/ui';
import { Plus } from 'lucide-react';
import { canAccess } from '@/lib/rbac';
import type { UserRole } from '@/lib/types';

export default function MessageTemplateActions({ role }: { role: UserRole }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!canAccess(role, 'messageTemplate')) return null;

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/message-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Mẫu tin nhắn mới',
          category: 'Chung',
          channel: 'Zalo',
          content: 'Xin chào anh/chị,\nEm liên hệ để hỗ trợ...'
        }),
      });
      
      if (!res.ok) throw new Error('Lỗi tạo mẫu');
      const data = await res.json();
      toast.success('Đã tạo mẫu mới');
      router.push(`/admin/message-templates/${data.id}`);
    } catch {
      toast.error('Có lỗi xảy ra khi tạo');
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleCreate} loading={loading} variant="primary" icon={<Plus size={16} />}>
      Tạo mẫu
    </Button>
  );
}
