'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, ExternalLink, Link2, ShieldCheck } from 'lucide-react';
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

interface CreateGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultDemoId?: string;
}

interface DemoOption {
  id: string;
  title: string;
  slug: string;
}

interface LeadOption {
  id: string;
  name: string;
  email: string;
  company: string | null;
}

export default function CreateGrantModal({
  isOpen,
  onClose,
  onSuccess,
  defaultDemoId,
}: CreateGrantModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [demos, setDemos] = useState<DemoOption[]>([]);
  const [leads, setLeads] = useState<LeadOption[]>([]);

  const [demoId, setDemoId] = useState(defaultDemoId || '');
  const [email, setEmail] = useState('');
  const [leadId, setLeadId] = useState('');
  const [maxViews, setMaxViews] = useState('10');
  const [expiresDate, setExpiresDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [note, setNote] = useState('');

  // Result state after creation
  const [createdShareUrl, setCreatedShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCreatedShareUrl(null);
      setCopied(false);
      setError(null);

      // Tải danh sách demo
      fetch('/api/admin/demos')
        .then((res) => res.json())
        .then((json) => {
          if (json?.data) {
            setDemos(json.data);
            if (!demoId && json.data.length > 0) {
              setDemoId(defaultDemoId || json.data[0].id);
            }
          }
        })
        .catch(console.error);

      // Tải danh sách lead
      fetch('/api/admin/leads?page=1')
        .then((res) => res.json())
        .then((json) => {
          if (json?.data) {
            setLeads(json.data);
          }
        })
        .catch(console.error);
    }
  }, [isOpen, defaultDemoId]);

  const handleLeadSelect = (selectedLeadId: string) => {
    setLeadId(selectedLeadId);
    if (selectedLeadId) {
      const found = leads.find((l) => l.id === selectedLeadId);
      if (found?.email) {
        setEmail(found.email);
      }
    }
  };

  const handleCopyLink = () => {
    if (!createdShareUrl) return;
    const fullUrl = `${window.location.origin}${createdShareUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoId) {
      setError('Vui lòng chọn một demo.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/demos/grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoId,
          email: email.trim().toLowerCase(),
          leadId: leadId || null,
          maxViews: maxViews ? parseInt(maxViews, 10) : null,
          expiresAt: expiresDate ? new Date(`${expiresDate}T23:59:59Z`).toISOString() : null,
          note: note.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Không thể cấp quyền xem demo.');
      }

      setCreatedShareUrl(json.shareUrl);
      onSuccess?.();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi cấp quyền xem demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader title="Cấp Quyền Xem Demo Riêng" onClose={onClose} />

      {createdShareUrl ? (
        <div className="p-6">
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
            <ShieldCheck size={22} className="flex-none text-green-600" />
            <div>
              <p className="font-semibold text-sm">Đã cấp quyền truy cập thành công!</p>
              <p className="text-xs text-green-700">
                Link dưới đây chứa token bảo mật riêng cho <b>{email}</b>.
              </p>
            </div>
          </div>

          <FormField label="Link chia sẻ bảo mật (Secret Share URL)">
            <div className="flex gap-2">
              <code className="flex flex-1 items-center gap-1.5 truncate rounded-lg border border-border bg-[#F8F9FA] px-3 py-2 font-mono text-xs text-ink">
                <Link2 size={14} className="flex-none text-muted" />
                {typeof window !== 'undefined' ? window.location.origin : ''}
                {createdShareUrl}
              </code>
              <Button
                variant={copied ? 'secondary' : 'primary'}
                icon={copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
                onClick={handleCopyLink}
              >
                {copied ? 'Đã chép' : 'Sao chép'}
              </Button>
            </div>
          </FormField>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              icon={<ExternalLink size={14} />}
              onClick={() => window.open(createdShareUrl, '_blank')}
            >
              Mở thử link
            </Button>
            <Button variant="primary" onClick={onClose}>
              Hoàn tất
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <ModalBody className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <FormField label="Chọn Demo cần cấp quyền" required>
              <Select
                value={demoId}
                onChange={(e) => setDemoId(e.target.value)}
                options={demos.map((d) => ({
                  value: d.id,
                  label: `${d.title} (/${d.slug})`,
                }))}
              />
            </FormField>

            <FormField label="Gắn với Lead CRM (tuỳ chọn)">
              <Select
                value={leadId}
                onChange={(e) => handleLeadSelect(e.target.value)}
                options={[
                  { value: '', label: '— Không gắn với Lead nào —' },
                  ...leads.map((l) => ({
                    value: l.id,
                    label: `${l.name} (${l.company || l.email})`,
                  })),
                ]}
              />
            </FormField>

            <FormField label="Email người nhận quyền" required hint="Dùng để gửi link và kiểm tra định danh">
              <Input
                type="email"
                placeholder="khachhang@congty.com..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Giới hạn lượt xem" hint="Để trống nếu không giới hạn">
                <Input
                  type="number"
                  placeholder="Ví dụ: 10"
                  value={maxViews}
                  onChange={(e) => setMaxViews(e.target.value)}
                />
              </FormField>

              <FormField label="Ngày hết hạn" hint="Sau ngày này link sẽ khoá">
                <Input
                  type="date"
                  value={expiresDate}
                  onChange={(e) => setExpiresDate(e.target.value)}
                />
              </FormField>
            </div>

            <FormField label="Ghi chú nội bộ" hint="Mục đích cấp quyền hoặc ngữ cảnh trao đổi">
              <Textarea
                rows={2}
                placeholder="Gửi bản demo cho Giám đốc kỹ thuật xem trước buổi demo trực tiếp..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </FormField>
          </ModalBody>

          <ModalFooter>
            <Button variant="secondary" onClick={onClose} disabled={loading} type="button">
              Hủy
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              Tạo Quyền & Sinh Link
            </Button>
          </ModalFooter>
        </form>
      )}
    </Modal>
  );
}
