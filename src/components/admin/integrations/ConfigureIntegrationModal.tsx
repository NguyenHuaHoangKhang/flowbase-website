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
} from '@/components/admin/ui';
import type { Integration } from '@/lib/types';

interface ConfigureIntegrationModalProps {
  isOpen: boolean;
  integration: Integration | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ConfigureIntegrationModal({
  isOpen,
  integration,
  onClose,
  onSuccess,
}: ConfigureIntegrationModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [secretRef, setSecretRef] = useState('');
  const [scopesInput, setScopesInput] = useState('');

  useEffect(() => {
    if (integration) {
      setName(integration.name);
      setSecretRef(integration.secretRef || '');
      setScopesInput(integration.scopes.join(', '));
      setError(null);
    }
  }, [integration]);

  if (!integration) return null;

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
      const res = await fetch(`/api/admin/integrations/${integration.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          secretRef: secretRef.trim() || null,
          scopes,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Không thể cập nhật cấu hình kết nối.');
      }

      onSuccess?.();
      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi lưu cấu hình.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader title={`Cấu hình kết nối: ${integration.name}`} onClose={onClose} />
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <FormField label="Tên kết nối" required>
            <Input
              placeholder="Ví dụ: Thông báo lead mới..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>

          <FormField
            label="Biến môi trường Secret (secretRef)"
            hint="Chỉ lưu TÊN biến (ví dụ: SLACK_BOT_TOKEN). Tuyệt đối không dán token thật vào đây."
          >
            <Input
              placeholder="SLACK_BOT_TOKEN, RESEND_API_KEY..."
              value={secretRef}
              onChange={(e) => setSecretRef(e.target.value)}
              className="font-mono"
            />
          </FormField>

          <FormField label="Phạm vi truy cập (Scopes)" hint="Phân tách bằng dấu phẩy">
            <Input
              placeholder="chat:write, channels:read..."
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
            Lưu cấu hình
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
