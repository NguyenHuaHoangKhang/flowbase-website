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

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ClientOption {
  id: string;
  name: string;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    clientId: '',
    status: 'BACKLOG',
    priority: 'NORMAL',
    billingType: 'FIXED',
    budgetAmount: 0,
    currency: 'VND',
    hourlyRate: 0,
    startDate: '',
    dueDate: '',
    summary: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetch('/api/admin/clients?page=1')
        .then((res) => res.json())
        .then((json) => {
          if (json?.data) {
            setClients(json.data);
          }
        })
        .catch((err) => console.error('Failed to load clients:', err));
    }
  }, [isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tên dự án.');
      return;
    }

    if (formData.startDate && formData.dueDate && formData.dueDate < formData.startDate) {
      setError('Hạn chót phải sau hoặc cùng ngày với ngày bắt đầu.');
      return;
    }

    if (formData.billingType === 'HOURLY' && (!formData.hourlyRate || formData.hourlyRate <= 0)) {
      setError('Dự án tính theo giờ phải có đơn giá giờ hợp lệ.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: formData.title.trim(),
        code: formData.code.trim() || undefined,
        clientId: formData.clientId || null,
        status: formData.status,
        priority: formData.priority,
        billingType: formData.billingType,
        budgetAmount: formData.budgetAmount || 0,
        currency: formData.currency,
        hourlyRate: formData.billingType === 'HOURLY' ? formData.hourlyRate : null,
        startDate: formData.startDate || null,
        dueDate: formData.dueDate || null,
        summary: formData.summary.trim() || null,
      };

      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Có lỗi xảy ra khi tạo dự án.');
        setLoading(false);
        return;
      }

      setFormData({
        title: '',
        code: '',
        clientId: '',
        status: 'BACKLOG',
        priority: 'NORMAL',
        billingType: 'FIXED',
        budgetAmount: 0,
        currency: 'VND',
        hourlyRate: 0,
        startDate: '',
        dueDate: '',
        summary: '',
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
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          title="Tạo Dự Án Mới"
          description="Khởi tạo dự án vào pipeline, phân bổ ngân sách và thiết lập giai đoạn ban đầu."
          onClose={onClose}
        />

        <ModalBody className="space-y-4">
          {error && (
            <div className="rounded-[10px] border border-[#EF4444]/30 bg-[#EF4444]/[0.08] p-3 text-xs font-medium text-[#B91C1C]">
              {error}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <FormField label="Tên dự án" required hint="Tên dự án hoặc tính năng triển khai">
                <Input
                  placeholder="VD: App chấm công, Web portal..."
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </FormField>
            </div>

            <FormField label="Mã dự án" hint="Nhập tự do hoặc để trống tự sinh">
              <Input
                placeholder="VD: PROJ-01"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                disabled={loading}
              />
            </FormField>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Khách hàng">
              <Select
                value={formData.clientId}
                onChange={(e) => handleChange('clientId', e.target.value)}
                disabled={loading}
                options={[
                  { value: '', label: '— Chưa gán khách hàng —' },
                  ...clients.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            </FormField>

            <FormField label="Giai đoạn bắt đầu">
              <Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                disabled={loading}
                options={[
                  { value: 'BACKLOG', label: 'Backlog (Tiếp nhận)' },
                  { value: 'DISCOVERY', label: 'Discovery (Khảo sát)' },
                  { value: 'PROPOSAL', label: 'Proposal (Báo giá / Đề xuất)' },
                  { value: 'SIGNED', label: 'Signed (Đã chốt hợp đồng)' },
                  { value: 'IN_PROGRESS', label: 'In Progress (Đang làm)' },
                  { value: 'UAT', label: 'UAT (Nghiệm thu)' },
                  { value: 'DELIVERED', label: 'Delivered (Bàn giao)' },
                ]}
              />
            </FormField>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <FormField label="Hình thức thanh toán">
              <Select
                value={formData.billingType}
                onChange={(e) => handleChange('billingType', e.target.value)}
                disabled={loading}
                options={[
                  { value: 'FIXED', label: 'Trọn gói (Fixed)' },
                  { value: 'MILESTONE', label: 'Theo mốc (Milestone)' },
                  { value: 'HOURLY', label: 'Theo giờ (Hourly)' },
                  { value: 'RETAINER', label: 'Định kỳ (Retainer)' },
                ]}
              />
            </FormField>

            <FormField label="Ngân sách dự tính">
              <MoneyInput
                value={formData.budgetAmount}
                onChange={(val) => handleChange('budgetAmount', val)}
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

          {formData.billingType === 'HOURLY' && (
            <FormField label="Đơn giá theo giờ" required hint="Áp dụng cho dự án tính giờ">
              <MoneyInput
                value={formData.hourlyRate}
                onChange={(val) => handleChange('hourlyRate', val)}
                disabled={loading}
              />
            </FormField>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <FormField label="Độ ưu tiên">
              <Select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                disabled={loading}
                options={[
                  { value: 'LOW', label: 'Thấp (Low)' },
                  { value: 'NORMAL', label: 'Bình thường (Normal)' },
                  { value: 'HIGH', label: 'Cao (High)' },
                  { value: 'URGENT', label: 'Khẩn cấp (Urgent)' },
                ]}
              />
            </FormField>

            <FormField label="Ngày bắt đầu">
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                disabled={loading}
              />
            </FormField>

            <FormField label="Hạn hoàn thành">
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                disabled={loading}
              />
            </FormField>
          </div>

          <FormField label="Mô tả / Tóm tắt mục tiêu">
            <Textarea
              placeholder="Mục tiêu cốt lõi, phạm vi bàn giao hoặc các yêu cầu kỹ thuật..."
              rows={2}
              value={formData.summary}
              onChange={(e) => handleChange('summary', e.target.value)}
              disabled={loading}
            />
          </FormField>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Tạo dự án
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
