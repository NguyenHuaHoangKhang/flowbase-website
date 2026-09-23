'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Lock, Unlock, Trash2 } from 'lucide-react';
import { Button, ConfirmDialog } from '@/components/admin/ui';
import EditUserModal from './EditUserModal';
import type { User } from '@/lib/types';

interface UserRowActionsProps {
  user: User;
  currentUserId: string;
}

export default function UserRowActions({ user, currentUserId }: UserRowActionsProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isSelf = user.id === currentUserId;
  const isSuspended = user.status === 'SUSPENDED';

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      const nextStatus = isSuspended ? 'ACTIVE' : 'SUSPENDED';
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Thao tác không thành công.');
        return;
      }
      setIsStatusConfirmOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Thao tác không thành công.');
        return;
      }
      setIsDeleteConfirmOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xoá người dùng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5 justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditOpen(true)}
          title="Sửa thông tin & vai trò"
        >
          <Edit2 size={13.5} className="mr-1 text-muted" /> Sửa
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={isSelf}
          onClick={() => setIsStatusConfirmOpen(true)}
          title={isSelf ? 'Không thể tự khoá tài khoản của bạn' : isSuspended ? 'Mở khoá tài khoản' : 'Khoá tài khoản'}
          className={isSuspended ? 'text-[#15803D]' : 'text-[#B45309]'}
        >
          {isSuspended ? (
            <>
              <Unlock size={13.5} className="mr-1" /> Mở
            </>
          ) : (
            <>
              <Lock size={13.5} className="mr-1" /> Khoá
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={isSelf}
          onClick={() => setIsDeleteConfirmOpen(true)}
          title={isSelf ? 'Không thể tự xoá tài khoản của bạn' : 'Xoá người dùng'}
          className="text-[#B91C1C] hover:bg-[#EF4444]/10"
        >
          <Trash2 size={13.5} />
        </Button>
      </div>

      <EditUserModal
        user={user}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />

      <ConfirmDialog
        isOpen={isStatusConfirmOpen}
        onClose={() => setIsStatusConfirmOpen(false)}
        onConfirm={handleToggleStatus}
        title={isSuspended ? `Mở khoá tài khoản: ${user.name}` : `Khoá tài khoản: ${user.name}`}
        description={
          isSuspended
            ? `Bạn có chắc muốn kích hoạt lại tài khoản ${user.email}? Người dùng sẽ có thể đăng nhập lại vào hệ thống.`
            : `Tài khoản ${user.email} sẽ bị vô hiệu hoá. Mọi phiên làm việc hiện tại sẽ bị huỷ ngay lập tức.`
        }
        confirmText={isSuspended ? 'Kích hoạt' : 'Khoá tài khoản'}
        tone={isSuspended ? 'info' : 'warning'}
        loading={loading}
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title={`Xoá người dùng: ${user.name}`}
        description={`Bạn có chắc muốn xoá tài khoản ${user.email}? Tài khoản sẽ được chuyển sang trạng thái xoá mềm (soft-delete) và toàn bộ phiên đăng nhập sẽ bị huỷ.`}
        confirmText="Xác nhận xoá"
        tone="danger"
        loading={loading}
      />
    </>
  );
}
