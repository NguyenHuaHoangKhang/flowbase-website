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
  MoneyInput,
  Textarea,
} from '@/components/admin/ui';
import { formatMoneyShort } from '@/lib/format';

interface CreateMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  budgetAmount: number;
  totalAllocated: number;
}

export default function CreateMilestoneModal({
  isOpen,
  onClose,
  projectId,
  budgetAmount,
  totalAllocated,
}: CreateMilestoneModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    detail: '',
    amount: 0,
    percentage: '',
    dueDate: '',
  });

  const remainingAmount = budgetAmount - totalAllocated;

  const handleChange = (field: string, value: any) => {
    let updates: any = { [field]: value };

    // If typing percentage, calculate amount
    if (field === 'percentage') {
      const p = parseFloat(value);
      if (!isNaN(p)) {
        updates.amount = Math.round((budgetAmount * p) / 100);
      } else if (value === '') {
        updates.amount = 0;
      }
    }

    // If typing amount, calculate percentage
    if (field === 'amount') {
      if (budgetAmount > 0) {
        updates.percentage = ((value / budgetAmount) * 100).toFixed(1);
        // Clean up trailing .0 if present
        if (updates.percentage.endsWith('.0')) {
          updates.percentage = updates.percentage.slice(0, -2);
        }
      } else {
        updates.percentage = '';
      }
    }

    setFormData((prev) => ({ ...prev, ...updates }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tên mốc thanh toán.');
      return;
    }
    
    if (formData.amount > remainingAmount && remainingAmount >= 0) {
      setError(`Số tiền vượt quá ngân sách còn lại (${formatMoneyShort(remainingAmount)}).`);
      // Warning only, don't necessarily block if they want to over-allocate, but typically we block. Let's block.
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: formData.title.trim(),
        detail: formData.detail.trim() || null,
        amount: formData.amount || 0,
        dueDate: formData.dueDate || null,
      };

      const res = await fetch(`/api/admin/projects/${projectId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Có lỗi xảy ra khi tạo mốc thanh toán.');
        setLoading(false);
        return;
      }

      setFormData({
        title: '',
        detail: '',
        amount: 0,
        percentage: '',
        dueDate: '',
      });

      onClose();
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
          title="Tạo Mốc Thanh Toán"
          description="Thêm đợt thanh toán hoặc mốc bàn giao dự án."
          onClose={onClose}
        />

        <ModalBody className="space-y-4">
          {error && (
            <div className="rounded-[10px] border border-[#EF4444]/30 bg-[#EF4444]/[0.08] p-3 text-xs font-medium text-[#B91C1C]">
              {error}
            </div>
          )}

          <div className="rounded-lg bg-muted/50 p-3 text-xs flex justify-between">
            <div>Tổng: <strong className="text-foreground">{formatMoneyShort(budgetAmount)}</strong></div>
            <div>Đã chia: <strong className="text-foreground">{formatMoneyShort(totalAllocated)}</strong></div>
            <div>Còn lại: <strong className={remainingAmount < 0 ? 'text-destructive' : 'text-primary'}>{formatMoneyShort(remainingAmount)}</strong></div>
          </div>

          <FormField label="Tên mốc thanh toán" required hint="Ví dụ: Đợt 1 - Tạm ứng, Giai đoạn thiết kế...">
            <Input
              placeholder="VD: Đợt 1 - Tạm ứng"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              disabled={loading}
              autoFocus
            />
          </FormField>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="col-span-1">
              <FormField label="Phần trăm (%)">
                <Input
                  type="number"
                  placeholder="VD: 30"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.percentage}
                  onChange={(e) => handleChange('percentage', e.target.value)}
                  disabled={loading || budgetAmount === 0}
                />
              </FormField>
            </div>
            <div className="col-span-2">
              <FormField label="Số tiền thanh toán">
                <MoneyInput
                  value={formData.amount}
                  onChange={(val) => handleChange('amount', val)}
                  disabled={loading}
                />
              </FormField>
            </div>
          </div>

          <FormField label="Hạn thanh toán">
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              disabled={loading}
            />
          </FormField>

          <FormField label="Chi tiết">
            <Textarea
              placeholder="Mô tả điều kiện nghiệm thu, bàn giao..."
              rows={2}
              value={formData.detail}
              onChange={(e) => handleChange('detail', e.target.value)}
              disabled={loading}
            />
          </FormField>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" type="button" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Tạo mốc
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
