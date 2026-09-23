'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, User as UserIcon, Key, AlertCircle } from 'lucide-react';
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
import type { UserRole } from '@/lib/types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const roleDescriptions: Record<UserRole, string> = {
  OWNER: 'Toàn quyền cao nhất: quản lý tài chính, nhân sự, phân quyền và kết nối hệ thống.',
  ADMIN: 'Quản trị nghiệp vụ: CRM, Dự án, Demo, Hoá đơn, Chi phí và Kết nối. Không quản lý nhân sự.',
  EDITOR: 'Biên tập viên: Quản lý Demo, Lead, Dự án. Ẩn hoàn toàn dữ liệu tài chính & kết nối.',
  VIEWER: 'Chỉ xem: Xem Dashboard, Demo, Lead, Khách hàng, Dự án. Không có quyền sửa hoặc ghi.',
};

export default function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('VIEWER');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INVITED'>('ACTIVE');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Vui lòng nhập đầy đủ họ tên và email.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          status,
          password: password.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể tạo người dùng.');
      }

      setName('');
      setEmail('');
      setRole('VIEWER');
      setPassword('');
      setStatus('ACTIVE');
      onClose();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi tạo người dùng.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          title="Mời thành viên mới"
          description="Khởi tạo tài khoản nhân sự và phân bổ quyền truy cập hệ thống."
        />

        <ModalBody className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-sm text-[#B91C1C]">
              <AlertCircle size={16} className="flex-none" />
              <span>{error}</span>
            </div>
          )}

          <FormField label="Họ và tên" required hint="Tên hiển thị trong nhật ký kiểm toán và báo cáo">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              required
              autoFocus
            />
          </FormField>

          <FormField label="Email công vụ" required hint="Dùng để đăng nhập vào trang quản trị">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nhanvien@flowbase.studio"
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

            <FormField label="Trạng thái khởi tạo" required>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                options={[
                  { value: 'ACTIVE', label: 'Hoạt động ngay' },
                  { value: 'INVITED', label: 'Chờ kích hoạt (Đã mời)' },
                ]}
              />
            </FormField>
          </div>

          <div className="rounded-lg border border-border bg-[#F8FAFC] p-3 text-[12.5px] text-muted">
            <div className="flex items-center gap-1.5 font-semibold text-[#1E293B]">
              <Shield size={14} className="text-primary" />
              Quyền hạn vai trò {role}:
            </div>
            <p className="mt-1 leading-relaxed">{roleDescriptions[role]}</p>
          </div>

          <FormField
            label="Mật khẩu khởi tạo"
            hint="Để trống nếu muốn hệ thống tự tạo mật khẩu ngẫu nhiên tạm thời"
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
            Tạo tài khoản
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
