'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, AlertTriangle, Shield } from 'lucide-react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormField,
  Input,
  Select,
} from '@/components/admin/ui';
import type { User, UserRole } from '@/lib/types';

interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditUserModal({ user, isOpen, onClose }: EditUserModalProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('VIEWER');
  const [status, setStatus] = useState<'ACTIVE' | 'INVITED' | 'SUSPENDED'>('ACTIVE');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setRole(user.role);
      setStatus(user.status as any);
      setPassword('');
      setError(null);
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Họ tên không được để trống.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        name: name.trim(),
        role,
        status,
      };
      if (password.trim()) {
        payload.password = password.trim();
      }

      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể cập nhật người dùng.');
      }

      onClose();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi cập nhật.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          title={`Sửa người dùng: ${user.name}`}
          description={`Email: ${user.email}`}
        />

        <ModalBody className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-sm text-[#B91C1C]">
              <AlertCircle size={16} className="flex-none" />
              <span>{error}</span>
            </div>
          )}

          {user.role === 'OWNER' && role !== 'OWNER' && (
            <div className="flex items-start gap-2.5 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-3 text-[13px] text-[#B45309]">
              <AlertTriangle size={17} className="flex-none mt-0.5" />
              <div>
                <b>Cảnh báo hạ cấp vai trò:</b> Bạn đang hạ cấp một tài khoản OWNER. Hệ thống sẽ từ chối nếu đây là OWNER duy nhất đang hoạt động.
              </div>
            </div>
          )}

          <FormField label="Họ và tên" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Vai trò phân quyền" required>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                options={[
                  { value: 'OWNER', label: 'OWNER (Chủ sở hữu)' },
                  { value: 'ADMIN', label: 'ADMIN (Quản trị viên)' },
                  { value: 'EDITOR', label: 'EDITOR (Biên tập viên)' },
                  { value: 'VIEWER', label: 'VIEWER (Chỉ xem)' },
                ]}
              />
            </FormField>

            <FormField label="Trạng thái tài khoản" required>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                options={[
                  { value: 'ACTIVE', label: 'Hoạt động (ACTIVE)' },
                  { value: 'SUSPENDED', label: 'Đã khoá (SUSPENDED)' },
                  { value: 'INVITED', label: 'Chờ kích hoạt (INVITED)' },
                ]}
              />
            </FormField>
          </div>

          <FormField
            label="Đặt lại mật khẩu mới"
            hint="Chỉ nhập khi muốn đổi mật khẩu người dùng này. Để trống nếu giữ nguyên."
          >
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </FormField>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" type="button" onClick={onClose} disabled={submitting}>
            Huỷ
          </Button>
          <Button variant="primary" type="submit" loading={submitting}>
            Lưu thay đổi
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
