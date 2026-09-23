'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
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
import { formatMoney, formatMoneyShort } from '@/lib/format';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: string;
    code: string;
    total: number;
    amountPaid: number;
    currency: string;
  };
  onSuccess?: () => void;
}

export default function RecordPaymentModal({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}: RecordPaymentModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = Math.max(0, invoice.total - invoice.amountPaid);
  const today = new Date().toISOString().slice(0, 10);

  const [formData, setFormData] = useState({
    amount: remaining,
    method: 'BANK_TRANSFER',
    paidAt: today,
    reference: '',
    note: '',
  });

  useEffect(() => {
    if (isOpen) {
      const rem = Math.max(0, invoice.total - invoice.amountPaid);
      setFormData({
        amount: rem,
        method: 'BANK_TRANSFER',
        paidAt: today,
        reference: '',
        note: '',
      });
      setError(null);
    }
  }, [isOpen, invoice]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleFillFull = () => {
    setFormData((prev) => ({ ...prev, amount: remaining }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || formData.amount <= 0) {
      setError('Số tiền thanh toán phải lớn hơn 0.');
      return;
    }

    if (formData.amount > remaining) {
      setError(`Số tiền thanh toán (${formatMoney(formData.amount, invoice.currency as any)}) không được vượt quá số còn lại (${formatMoney(remaining, invoice.currency as any)}).`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/invoices/${invoice.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(formData.amount),
          currency: invoice.currency,
          method: formData.method,
          paidAt: formData.paidAt,
          reference: formData.reference.trim() || null,
          note: formData.note.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Có lỗi xảy ra khi ghi nhận thanh toán.');
        setLoading(false);
        return;
      }

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
          title={`Ghi Nhận Thanh Toán — ${invoice.code}`}
          description="Cập nhật khoản tiền khách hàng đã thanh toán. Database Trigger sẽ tự động cập nhật trạng thái hoá đơn."
          onClose={onClose}
        />

        <ModalBody className="space-y-4">
          {error && (
            <div className="rounded-[10px] border border-[#EF4444]/30 bg-[#EF4444]/[0.08] p-3 text-xs font-medium text-[#B91C1C]">
              {error}
            </div>
          )}

          {/* Thẻ tóm tắt số tiền */}
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-[#FBFCFD] p-3 text-center">
            <div>
              <span className="block text-[11px] text-muted">Tổng tiền</span>
              <span className="font-mono text-xs font-semibold text-foreground">
                {formatMoneyShort(invoice.total, invoice.currency as any)}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-muted">Đã thu</span>
              <span className="font-mono text-xs font-semibold text-[#15803D]">
                {formatMoneyShort(invoice.amountPaid, invoice.currency as any)}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-muted">Còn lại</span>
              <span className="font-mono text-xs font-bold text-[#B91C1C]">
                {formatMoneyShort(remaining, invoice.currency as any)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">
              Số tiền thu đợt này <span className="text-[#EF4444]">*</span>
            </label>
            {formData.amount !== remaining && remaining > 0 && (
              <button
                type="button"
                onClick={handleFillFull}
                className="flex items-center gap-1 text-[11.5px] font-medium text-primary hover:underline"
              >
                <CheckCircle2 size={13} />
                Thu đủ ({formatMoneyShort(remaining, invoice.currency as any)})
              </button>
            )}
          </div>

          <MoneyInput
            value={formData.amount}
            onChange={(val) => handleChange('amount', val)}
            disabled={loading}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Phương thức thanh toán">
              <Select
                value={formData.method}
                onChange={(e) => handleChange('method', e.target.value)}
                disabled={loading}
                options={[
                  { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng' },
                  { value: 'CASH', label: 'Tiền mặt' },
                  { value: 'CARD', label: 'Thẻ tín dụng / Ghi nợ' },
                  { value: 'E_WALLET', label: 'Ví điện tử' },
                  { value: 'OTHER', label: 'Khác' },
                ]}
              />
            </FormField>

            <FormField label="Ngày nhận tiền" required>
              <Input
                type="date"
                value={formData.paidAt}
                onChange={(e) => handleChange('paidAt', e.target.value)}
                disabled={loading}
              />
            </FormField>
          </div>

          <FormField label="Số tham chiếu / Mã GD ngân hàng" hint="VD: FT26040200338 hoặc UNC số...">
            <Input
              placeholder="FT..."
              value={formData.reference}
              onChange={(e) => handleChange('reference', e.target.value)}
              disabled={loading}
            />
          </FormField>

          <FormField label="Ghi chú đợt thu">
            <Textarea
              placeholder="Ghi chú nội bộ..."
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
            Xác nhận đã thu tiền
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
