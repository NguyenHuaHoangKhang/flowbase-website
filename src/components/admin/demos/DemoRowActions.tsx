'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { Button, ConfirmDialog } from '@/components/admin/ui';
import EditDemoModal from './EditDemoModal';
import type { Demo, UserRole } from '@/lib/types';

interface DemoRowActionsProps {
  demo: Demo;
  role: UserRole;
}

export default function DemoRowActions({ demo, role }: DemoRowActionsProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canEdit = role === 'OWNER' || role === 'ADMIN' || role === 'EDITOR';
  const canDelete = role === 'OWNER' || role === 'ADMIN';

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/demos/${demo.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Không thể xoá demo.');
      }
      setIsDeleteOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi xoá demo.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        variant="ghost"
        size="sm"
        icon={<ExternalLink size={13} />}
        onClick={() => window.open(`/demo/${demo.slug}`, '_blank')}
        title="Xem trang demo công khai"
      >
        Xem
      </Button>

      {canEdit && (
        <Button
          variant="ghost"
          size="sm"
          icon={<Edit2 size={13} />}
          onClick={() => setIsEditOpen(true)}
          title="Chỉnh sửa demo"
        >
          Sửa
        </Button>
      )}

      {canDelete && (
        <Button
          variant="ghost"
          size="sm"
          icon={<Trash2 size={13} className="text-red-500" />}
          onClick={() => setIsDeleteOpen(true)}
          title="Xoá mềm demo"
        >
          Xoá
        </Button>
      )}

      <EditDemoModal
        isOpen={isEditOpen}
        demo={demo}
        onClose={() => setIsEditOpen(false)}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`Xác nhận xoá demo: ${demo.title}`}
        description={`Bản demo này sẽ được chuyển vào trạng thái xoá mềm (soft-delete). Khách hàng sẽ không thể truy cập qua slug "/${demo.slug}" nữa.`}
        confirmText="Xoá mềm demo"
        tone="danger"
        loading={deleting}
      />
    </div>
  );
}
