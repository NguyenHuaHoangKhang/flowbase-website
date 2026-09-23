'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormField,
  Input,
  Select,
  Textarea,
} from '@/components/admin/ui';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateClientModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateClientModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    taxCode: '',
    email: '',
    phone: '',
    status: 'PROSPECT',
    address: '',
    note: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Vui lòng nhập tên khách hàng.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Có lỗi xảy ra khi tạo khách hàng.');
        setLoading(false);
        return;
      }

      setFormData({
        name: '',
        legalName: '',
        taxCode: '',
        email: '',
        phone: '',
        status: 'PROSPECT',
        address: '',
        note: '',
      });

      onClose();
      if (onSuccess) onSuccess();
      router.refresh();
    } catch {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          title="Thêm Khách Hàng Mới"
          description="Khởi tạo hồ sơ khách hàng mới để quản lý dự án và xuất hoá đơn."
          onClose={onClose}
        />

        <ModalBody className="space-y-4">
          {error && (
            <div className="rounded-[10px] border border-[#EF4444]/30 bg-[#EF4444]/[0.08] p-3 text-xs font-medium text-[#B91C1C]">
              {error}
            </div>
          )}

          <FormField label="Tên khách hàng" required hint="Tên giao dịch hoặc tên gọi thường ngày">
            <Input
              placeholder="VD: Viettel Digital, Ahamove..."
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={loading}
              autoFocus
            />
          </FormField>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Tên pháp nhân (Đầy đủ)">
              <Input
                placeholder="Công ty Cổ phần..."
                value={formData.legalName}
                onChange={(e) => handleChange('legalName', e.target.value)}
                disabled={loading}
              />
            </FormField>

            <FormField label="Mã số thuế">
              <Input
                placeholder="VD: 0101234567"
                value={formData.taxCode}
                onChange={(e) => handleChange('taxCode', e.target.value)}
                disabled={loading}
              />
            </FormField>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Email liên hệ">
              <Input
                type="email"
                placeholder="contact@company.vn"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={loading}
              />
            </FormField>

            <FormField label="Số điện thoại">
              <Input
                placeholder="0912 345 678"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={loading}
              />
            </FormField>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Trạng thái">
              <Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                disabled={loading}
                options={[
                  { value: 'PROSPECT', label: 'Tiềm năng (Prospect)' },
                  { value: 'ACTIVE', label: 'Đang hợp tác (Active)' },
                  { value: 'INACTIVE', label: 'Tạm ngưng (Inactive)' },
                ]}
              />
            </FormField>

            <FormField label="Địa chỉ">
              <Input
                placeholder="Quận 1, TP. Hồ Chí Minh"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                disabled={loading}
              />
            </FormField>
          </div>

          <FormField label="Ghi chú">
            <Textarea
              placeholder="Yêu cầu đặc thù, người phụ trách..."
              rows={2}
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              disabled={loading}
            />
          </FormField>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Tạo khách hàng
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
