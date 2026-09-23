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
} from '@/components/admin/ui';

interface CreateIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateIntegrationModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateIntegrationModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [provider, setProvider] = useState('SLACK');
  const [name, setName] = useState('');
  const [secretRef, setSecretRef] = useState('');
  const [scopesInput, setScopesInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên kết nối.');
      return;
    }

    if (secretRef.trim() && !/^[A-Z0-9_]+$|^vault:\/\/[\w/-]+$/.test(secretRef.trim())) {
      setError('secretRef chỉ nhận tên biến môi trường (ví dụ: SLACK_BOT_TOKEN) hoặc vault key.');
      return;
    }

    setLoading(true);
    setError(null);

    const scopes = scopesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/admin/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          name: name.trim(),
          secretRef: secretRef.trim() || null,
          scopes,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Không thể tạo kết nối.');
      }

      setName('');
      setSecretRef('');
      setScopesInput('');

      onSuccess?.();
      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi tạo kết nối.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader title="Thêm Kết Nối Dịch Vụ Mới" onClose={onClose} />
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <FormField label="Dịch vụ / Nhà cung cấp" required>
            <Select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              options={[
                { value: 'SLACK', label: 'Slack' },
                { value: 'GOOGLE_SHEETS', label: 'Google Sheets' },
                { value: 'GOOGLE_DRIVE', label: 'Google Drive' },
                { value: 'GITHUB', label: 'GitHub' },
                { value: 'VERCEL', label: 'Vercel' },
                { value: 'RESEND', label: 'Resend' },
                { value: 'SENDGRID', label: 'SendGrid' },
                { value: 'STRIPE', label: 'Stripe' },
                { value: 'ZALO_OA', label: 'Zalo OA' },
                { value: 'GENERIC_WEBHOOK', label: 'Generic Webhook' },
              ]}
            />
          </FormField>

          <FormField label="Tên kết nối" required hint="Gợi nhớ mục đích sử dụng">
            <Input
              placeholder="Ví dụ: Đồng bộ khách hàng tiềm năng..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </FormField>

          <FormField
            label="Biến môi trường Secret (secretRef)"
            hint="Chỉ lưu TÊN biến (ví dụ: SLACK_BOT_TOKEN). Không dán token thật."
          >
            <Input
              placeholder="SLACK_BOT_TOKEN, GITHUB_ACCESS_TOKEN..."
              value={secretRef}
              onChange={(e) => setSecretRef(e.target.value)}
              className="font-mono"
            />
          </FormField>

          <FormField label="Phạm vi truy cập (Scopes)" hint="Phân tách bằng dấu phẩy">
            <Input
              placeholder="repo, read:user, chat:write..."
              value={scopesInput}
              onChange={(e) => setScopesInput(e.target.value)}
            />
          </FormField>
        </ModalBody>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose} disabled={loading} type="button">
            Hủy
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Tạo kết nối
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
