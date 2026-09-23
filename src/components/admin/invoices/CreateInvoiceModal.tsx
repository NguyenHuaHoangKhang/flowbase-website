'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
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
import { formatMoneyShort } from '@/lib/format';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ClientOption {
  id: string;
  name: string;
}

interface ProjectOption {
  id: string;
  code: string;
  title: string;
  clientId: string | null;
}

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function CreateInvoiceModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateInvoiceModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);

  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);

  const [formData, setFormData] = useState({
    code: '',
    clientId: '',
    projectId: '',
    issueDate: today,
    dueDate: due,
    currency: 'VND',
    discount: 0,
    taxRate: 8,
    note: '',
  });

  const [items, setItems] = useState<LineItem[]>([
    { description: 'Triển khai giai đoạn 1', quantity: 1, unitPrice: 0 },
  ]);

  useEffect(() => {
    if (isOpen) {
      // Load clients
      fetch('/api/admin/clients?page=1')
        .then((res) => res.json())
        .then((json) => {
          if (json?.data) setClients(json.data);
        })
        .catch(console.error);

      // Load projects
      fetch('/api/admin/projects?page=1')
        .then((res) => res.json())
        .then((json) => {
          if (json?.data) setProjects(json.data);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setError(null);
  };

  const addItem = () => {
    setItems((prev) => [...prev, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Math totals calculation
  const subtotal = items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
  const taxable = Math.max(0, subtotal - (Number(formData.discount) || 0));
  const taxAmount = Math.round((taxable * (Number(formData.taxRate) || 0)) / 100);
  const total = taxable + taxAmount;

  // Filter projects by selected client
  const filteredProjects = formData.clientId
    ? projects.filter((p) => !p.clientId || p.clientId === formData.clientId)
    : projects;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) {
      setError('Vui lòng chọn khách hàng.');
      return;
    }

    if (formData.dueDate < formData.issueDate) {
      setError('Hạn thanh toán phải sau hoặc cùng ngày phát hành.');
      return;
    }

    if (items.some((it) => !it.description.trim())) {
      setError('Vui lòng nhập mô tả cho tất cả các dòng hàng.');
      return;
    }

    if (items.some((it) => it.quantity <= 0 || it.unitPrice < 0)) {
      setError('Số lượng phải lớn hơn 0 và đơn giá không được âm.');
      return;
    }

    if (formData.discount > subtotal) {
      setError('Chiết khấu không được vượt quá tiền hàng.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        code: formData.code.trim() || undefined,
        clientId: formData.clientId,
        projectId: formData.projectId || null,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        currency: formData.currency,
        discount: Number(formData.discount) || 0,
        taxRate: Number(formData.taxRate) || 0,
        note: formData.note.trim() || null,
        items: items.map((it) => ({
          description: it.description.trim(),
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
        })),
      };

      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Có lỗi xảy ra khi tạo hoá đơn.');
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
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          title="Tạo Hoá Đơn Mới"
          description="Khởi tạo hoá đơn dịch vụ, thêm các dòng hàng và cấu hình thuế, chiết khấu."
          onClose={onClose}
        />

        <ModalBody className="space-y-4">
          {error && (
            <div className="rounded-[10px] border border-[#EF4444]/30 bg-[#EF4444]/[0.08] p-3 text-xs font-medium text-[#B91C1C]">
              {error}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <FormField label="Khách hàng" required>
              <Select
                value={formData.clientId}
                onChange={(e) => handleFieldChange('clientId', e.target.value)}
                disabled={loading}
                options={[
                  { value: '', label: '— Chọn khách hàng —' },
                  ...clients.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            </FormField>

            <FormField label="Dự án liên quan">
              <Select
                value={formData.projectId}
                onChange={(e) => handleFieldChange('projectId', e.target.value)}
                disabled={loading}
                options={[
                  { value: '', label: '— Không gắn dự án —' },
                  ...filteredProjects.map((p) => ({
                    value: p.id,
                    label: `${p.code} — ${p.title}`,
                  })),
                ]}
              />
            </FormField>

            <FormField label="Mã hoá đơn" hint="Bỏ trống để tự sinh INV-YYYY-XXX">
              <Input
                placeholder="INV-2026-001"
                value={formData.code}
                onChange={(e) => handleFieldChange('code', e.target.value)}
                disabled={loading}
              />
            </FormField>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Ngày phát hành" required>
              <Input
                type="date"
                value={formData.issueDate}
                onChange={(e) => handleFieldChange('issueDate', e.target.value)}
                disabled={loading}
              />
            </FormField>

            <FormField label="Hạn thanh toán" required>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                disabled={loading}
              />
            </FormField>
          </div>

          {/* Dòng hàng chi tiết (Line Items) */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                Chi tiết dịch vụ / sản phẩm ({items.length})
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={<Plus size={14} />}
                onClick={addItem}
                disabled={loading}
              >
                Thêm dòng
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((it, idx) => {
                const lineTotal = (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0);
                return (
                  <div
                    key={idx}
                    className="flex flex-col gap-2 rounded-xl border border-border bg-[#FBFBFC] p-3 sm:flex-row sm:items-center"
                  >
                    <div className="flex-1">
                      <Input
                        placeholder="Mô tả công việc hoặc hạng mục bàn giao..."
                        value={it.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        min="1"
                        placeholder="SL"
                        value={it.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                        disabled={loading}
                      />
                    </div>
                    <div className="w-36">
                      <MoneyInput
                        value={it.unitPrice}
                        onChange={(val) => handleItemChange(idx, 'unitPrice', val)}
                        disabled={loading}
                      />
                    </div>
                    <div className="w-28 text-right font-mono text-xs font-semibold text-foreground">
                      {formatMoneyShort(lineTotal)}
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        disabled={loading}
                        className="p-1 text-muted transition-colors hover:text-[#EF4444]"
                        title="Xóa dòng"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chiết khấu, Thuế & Tổng kết */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <FormField label="Chiết khấu (Giảm giá)">
                <MoneyInput
                  value={formData.discount}
                  onChange={(val) => handleFieldChange('discount', val)}
                  disabled={loading}
                />
              </FormField>

              <FormField label="Thuế GTGT (VAT %)">
                <Select
                  value={String(formData.taxRate)}
                  onChange={(e) => handleFieldChange('taxRate', Number(e.target.value))}
                  disabled={loading}
                  options={[
                    { value: '0', label: '0% (Không chịu thuế)' },
                    { value: '8', label: '8% (Ưu đãi)' },
                    { value: '10', label: '10% (Tiêu chuẩn)' },
                  ]}
                />
              </FormField>

              <FormField label="Tiền tệ">
                <Select
                  value={formData.currency}
                  onChange={(e) => handleFieldChange('currency', e.target.value)}
                  disabled={loading}
                  options={[
                    { value: 'VND', label: 'VND (₫)' },
                    { value: 'USD', label: 'USD ($)' },
                  ]}
                />
              </FormField>
            </div>

            <dl className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted">Tiền hàng (Tạm tính):</dt>
                <dd className="font-mono tabular-nums">{formatMoneyShort(subtotal, formData.currency as any)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Chiết khấu:</dt>
                <dd className="font-mono tabular-nums text-[#EF4444]">
                  - {formatMoneyShort(formData.discount, formData.currency as any)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Thuế VAT ({formData.taxRate}%):</dt>
                <dd className="font-mono tabular-nums">{formatMoneyShort(taxAmount, formData.currency as any)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
                <dt>Tổng thanh toán:</dt>
                <dd className="font-mono text-primary tabular-nums">
                  {formatMoneyShort(total, formData.currency as any)}
                </dd>
              </div>
            </dl>
          </div>

          <FormField label="Ghi chú hoá đơn">
            <Textarea
              placeholder="Thông tin tài khoản ngân hàng, điều khoản bảo hành..."
              rows={2}
              value={formData.note}
              onChange={(e) => handleFieldChange('note', e.target.value)}
              disabled={loading}
            />
          </FormField>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Tạo hoá đơn
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
