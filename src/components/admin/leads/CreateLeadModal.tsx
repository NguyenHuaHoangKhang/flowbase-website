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

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateLeadModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateLeadModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'WEBSITE_FORM',
    message: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Vui lòng nhập tên người liên hệ.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Vui lòng nhập email hợp lệ.');
      return;
    }
    if (formData.message.trim().length < 10) {
      setError('Mô tả quy trình cần tối thiểu 10 ký tự.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Có lỗi xảy ra khi tạo cơ hội mới.');
        setLoading(false);
        return;
      }

      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        source: 'WEBSITE_FORM',
        message: '',
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
          title="Tạo Cơ Hội Mới (Lead)"
          description="Ghi nhận yêu cầu làm phần mềm hoặc chuyển đổi quy trình Excel/Sheets từ khách hàng."
          onClose={onClose}
        />

        <ModalBody className="space-y-4">
          {error && (
            <div className="rounded-[10px] border border-[#EF4444]/30 bg-[#EF4444]/[0.08] p-3 text-xs font-medium text-[#B91C1C]">
              {error}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Họ tên người liên hệ" required>
              <Input
                placeholder="VD: Nguyễn Văn An"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={loading}
                autoFocus
              />
            </FormField>

            <FormField label="Email" required>
              <Input
                type="email"
                placeholder="an.nguyen@congty.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={loading}
              />
            </FormField>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Tên công ty / Doanh nghiệp">
              <Input
                placeholder="Công ty ABC..."
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                disabled={loading}
              />
            </FormField>

            <FormField label="Số điện thoại / Zalo">
              <Input
                placeholder="0901 234 567"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={loading}
              />
            </FormField>
          </div>

          <FormField label="Nguồn tiếp cận">
            <Select
              value={formData.source}
              onChange={(e) => handleChange('source', e.target.value)}
              disabled={loading}
              options={[
                { value: 'WEBSITE_FORM', label: 'Form Website' },
                { value: 'ZALO', label: 'Kênh Zalo' },
                { value: 'REFERRAL', label: 'Người quen giới thiệu' },
                { value: 'EMAIL', label: 'Email trực tiếp' },
                { value: 'LINKEDIN', label: 'LinkedIn' },
                { value: 'EVENT', label: 'Hội thảo / Sự kiện' },
                { value: 'OTHER', label: 'Khác' },
              ]}
            />
          </FormField>

          <FormField
            label="Mô tả quy trình thủ công / Nhu cầu"
            required
            hint="Tối thiểu 10 ký tự. Ví dụ: Cần chuyển đổi file Excel quản lý kho 20 chi nhánh sang phần mềm nội bộ..."
          >
            <Textarea
              rows={3}
              placeholder="Mô tả chi tiết yêu cầu..."
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              disabled={loading}
            />
          </FormField>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Tạo cơ hội
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
