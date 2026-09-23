'use client';

import React, { useState, useEffect } from 'react';
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
  MoneyInput,
  Textarea,
} from '@/components/admin/ui';

interface CreateExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ProjectOption {
  id: string;
  code: string;
  title: string;
}

export default function CreateExpenseModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateExpenseModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectOption[]>([]);

  const today = new Date().toISOString().slice(0, 10);

  const [formData, setFormData] = useState({
    vendor: '',
    category: 'SOFTWARE',
    description: '',
    amount: 0,
    currency: 'VND',
    spentAt: today,
    billable: false,
    recurrence: '',
    projectId: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetch('/api/admin/projects?page=1')
        .then((res) => res.json())
        .then((json) => {
          if (json?.data) setProjects(json.data);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vendor.trim()) {
      setError('Vui lòng nhập tên nhà cung cấp hoặc đối tác.');
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      setError('Số tiền chi phí phải lớn hơn 0.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        vendor: formData.vendor.trim(),
        category: formData.category,
        description: formData.description.trim() || null,
        amount: Number(formData.amount),
        currency: formData.currency,
        spentAt: formData.spentAt,
        billable: Boolean(formData.billable),
        recurrence: formData.recurrence || null,
        projectId: formData.projectId || null,
      };

      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Có lỗi xảy ra khi ghi nhận chi phí.');
        setLoading(false);
        return;
      }

      setFormData({
        vendor: '',
        category: 'SOFTWARE',
        description: '',
        amount: 0,
        currency: 'VND',
        spentAt: today,
        billable: false,
        recurrence: '',
        projectId: '',
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
          title="Ghi Nhận Chi Phí Mới"
          description="Lưu lại chi phí vận hành hạ tầng, bản quyền phần mềm hoặc chi phí gắn theo dự án."
          onClose={onClose}
        />

        <ModalBody className="space-y-4">
          {error && (
            <div className="rounded-[10px] border border-[#EF4444]/30 bg-[#EF4444]/[0.08] p-3 text-xs font-medium text-[#B91C1C]">
              {error}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Nhà cung cấp / Đối tác" required>
              <Input
                placeholder="VD: AWS, GitHub, Freelancer Designer..."
                value={formData.vendor}
                onChange={(e) => handleChange('vendor', e.target.value)}
                disabled={loading}
                autoFocus
              />
            </FormField>

            <FormField label="Nhóm chi phí">
              <Select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                disabled={loading}
                options={[
                  { value: 'INFRASTRUCTURE', label: 'Hạ tầng (Server, Cloud, Domain)' },
                  { value: 'SOFTWARE', label: 'Phần mềm & SaaS (License, API)' },
                  { value: 'CONTRACTOR', label: 'Thuê ngoài (Freelancer, Subcontractor)' },
                  { value: 'SALARY', label: 'Lương & Nhân sự nội bộ' },
                  { value: 'MARKETING', label: 'Marketing & Quảng cáo' },
                  { value: 'EQUIPMENT', label: 'Thiết bị & Công cụ' },
                  { value: 'TAX', label: 'Thuế & Pháp lý' },
                  { value: 'OTHER', label: 'Khác' },
                ]}
              />
            </FormField>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Số tiền chi" required>
              <MoneyInput
                value={formData.amount}
                onChange={(val) => handleChange('amount', val)}
                disabled={loading}
              />
            </FormField>

            <FormField label="Đơn vị tiền tệ">
              <Select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                disabled={loading}
                options={[
                  { value: 'VND', label: 'VND (₫)' },
                  { value: 'USD', label: 'USD ($)' },
                ]}
              />
            </FormField>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Ngày chi" required>
              <Input
                type="date"
                value={formData.spentAt}
                onChange={(e) => handleChange('spentAt', e.target.value)}
                disabled={loading}
              />
            </FormField>

            <FormField label="Định kỳ lặp lại">
              <Select
                value={formData.recurrence}
                onChange={(e) => handleChange('recurrence', e.target.value)}
                disabled={loading}
                options={[
                  { value: '', label: 'Một lần (Không lặp)' },
                  { value: 'monthly', label: 'Hằng tháng (Monthly)' },
                  { value: 'yearly', label: 'Hằng năm (Yearly)' },
                ]}
              />
            </FormField>
          </div>

          <FormField label="Gắn vào dự án (nếu có)">
            <Select
              value={formData.projectId}
              onChange={(e) => handleChange('projectId', e.target.value)}
              disabled={loading}
              options={[
                { value: '', label: '— Chi phí chung của công ty —' },
                ...projects.map((p) => ({
                  value: p.id,
                  label: `${p.code} — ${p.title}`,
                })),
              ]}
            />
          </FormField>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="billable"
              checked={formData.billable}
              onChange={(e) => handleChange('billable', e.target.checked)}
              disabled={loading}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="billable" className="text-xs font-medium text-foreground cursor-pointer">
              Tính khoản này vào hoá đơn khách hàng (Billable to client)
            </label>
          </div>

          <FormField label="Nội dung / Diễn giải">
            <Textarea
              placeholder="Mục đích chi, thời hạn tài khoản..."
              rows={2}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={loading}
            />
          </FormField>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Ghi nhận chi phí
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
