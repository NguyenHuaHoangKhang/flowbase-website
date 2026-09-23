'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Play, Power, Trash2, XCircle } from 'lucide-react';
import { Button, ConfirmDialog } from '@/components/admin/ui';
import type { WebhookEndpoint, UserRole } from '@/lib/types';

interface WebhookItemActionsProps {
  webhook: WebhookEndpoint;
  role: UserRole;
}

export default function WebhookItemActions({
  webhook,
  role,
}: WebhookItemActionsProps) {
  const router = useRouter();
  const [testing, setTesting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pingResult, setPingResult] = useState<{
    ok: boolean;
    status: string;
    responseCode: number | null;
  } | null>(null);

  const canEdit = role === 'OWNER' || role === 'ADMIN';
  const canDelete = role === 'OWNER' || role === 'ADMIN';

  const handleToggleActive = async () => {
    setToggling(true);
    try {
      const res = await fetch(`/api/admin/webhooks/${webhook.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !webhook.active }),
      });
      if (!res.ok) throw new Error('Không thể đổi trạng thái webhook.');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi thay đổi trạng thái.');
    } finally {
      setToggling(false);
    }
  };

  const handleTestPing = async () => {
    setTesting(true);
    setPingResult(null);
    try {
      const res = await fetch(`/api/admin/webhooks/${webhook.id}/test`, {
        method: 'POST',
      });
      const json = await res.json();
      setPingResult({
        ok: json.ok,
        status: json.status,
        responseCode: json.responseCode,
      });
      router.refresh();
    } catch (err) {
      setPingResult({
        ok: false,
        status: 'FAILED',
        responseCode: null,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/webhooks/${webhook.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Không thể xoá endpoint.');
      setIsDeleteOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi xoá endpoint.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {pingResult && (
        <span
          className={`flex items-center gap-1 text-[11.5px] font-mono ${
            pingResult.ok ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {pingResult.ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
          HTTP {pingResult.responseCode || 'ERR'}
        </span>
      )}

      {canEdit && (
        <Button
          size="sm"
          variant="ghost"
          icon={<Power size={13} className={webhook.active ? 'text-green-600' : 'text-gray-400'} />}
          loading={toggling}
          onClick={handleToggleActive}
          title={webhook.active ? 'Tạm dừng lắng nghe' : 'Bật lắng nghe'}
        >
          {webhook.active ? 'Đang bật' : 'Tắt'}
        </Button>
      )}

      <Button
        size="sm"
        variant="ghost"
        icon={<Play size={13} />}
        loading={testing}
        onClick={handleTestPing}
        title="Gửi sự kiện ping thử nghiệm"
      >
        Ping thử
      </Button>

      {canDelete && (
        <Button
          size="sm"
          variant="ghost"
          icon={<Trash2 size={13} className="text-red-500" />}
          onClick={() => setIsDeleteOpen(true)}
          title="Xoá endpoint"
        >
          Xoá
        </Button>
      )}

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xoá Webhook Endpoint"
        description={`Hệ thống sẽ ngừng bắn sự kiện tới URL: ${webhook.url}. Bạn có chắc chắn muốn xoá?`}
        confirmText="Xoá Endpoint"
        tone="danger"
        loading={deleting}
      />
    </div>
  );
}
