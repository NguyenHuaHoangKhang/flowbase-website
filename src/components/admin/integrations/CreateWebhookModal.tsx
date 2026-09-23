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
} from '@/components/admin/ui';
import { WEBHOOK_EVENTS } from '@/lib/validators';

interface CreateWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateWebhookModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateWebhookModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    'lead.created',
    'project.status_changed',
  ]);
  const [active, setActive] = useState(true);

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  };

  const handleSelectAll = () => {
    if (selectedEvents.length === WEBHOOK_EVENTS.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents([...WEBHOOK_EVENTS]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Vui lòng nhập URL endpoint.');
      return;
    }

    try {
      new URL(url.trim());
    } catch {
      setError('Định dạng URL không hợp lệ (cần bắt đầu bằng http:// hoặc https://).');
      return;
    }

    if (selectedEvents.length === 0) {
      setError('Vui lòng chọn ít nhất một sự kiện để lắng nghe.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          description: description.trim() || null,
          events: selectedEvents,
          active,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Không thể tạo webhook endpoint.');
      }

      setUrl('');
      setDescription('');
      setSelectedEvents(['lead.created', 'project.status_changed']);

      onSuccess?.();
      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi tạo webhook.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader title="Thêm Webhook Endpoint Mới" onClose={onClose} />
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <FormField
            label="Payload URL (Đường dẫn nhận sự kiện)"
            required
            hint="Hệ thống sẽ gửi HTTP POST kèm payload JSON tới URL này"
          >
            <Input
              type="url"
              placeholder="https://hooks.slack.com/services/... hoặc https://api.yourdomain.com/webhook"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus
            />
          </FormField>

          <FormField label="Mô tả mục đích sử dụng" hint="Tuỳ chọn ghi nhớ ngữ cảnh">
            <Input
              placeholder="Ví dụ: Đẩy thông báo lead mới vào kênh Slack Sales..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                Sự kiện đăng ký ({selectedEvents.length}/{WEBHOOK_EVENTS.length})
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-primary hover:underline"
              >
                {selectedEvents.length === WEBHOOK_EVENTS.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
            </div>

            <div className="grid max-h-[220px] grid-cols-1 gap-2 overflow-y-auto rounded-lg border border-border bg-[#F9FAFB] p-3 sm:grid-cols-2">
              {WEBHOOK_EVENTS.map((event) => {
                const checked = selectedEvents.includes(event);
                return (
                  <label
                    key={event}
                    className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 text-xs transition-colors ${
                      checked
                        ? 'border-primary/40 bg-white font-medium text-ink shadow-xs'
                        : 'border-transparent text-muted hover:bg-white/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleEvent(event)}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <code className="font-mono text-[11px]">{event}</code>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="webhook-active"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="webhook-active" className="cursor-pointer text-sm text-ink">
              Kích hoạt lắng nghe ngay (Active)
            </label>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose} disabled={loading} type="button">
            Hủy
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Đăng ký Endpoint
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
