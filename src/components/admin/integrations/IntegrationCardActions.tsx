'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, CheckCircle, RefreshCw, Settings, Trash2, XCircle } from 'lucide-react';
import { Button, ConfirmDialog } from '@/components/admin/ui';
import ConfigureIntegrationModal from './ConfigureIntegrationModal';
import type { Integration, UserRole } from '@/lib/types';

interface IntegrationCardActionsProps {
  integration: Integration;
  role: UserRole;
}

export default function IntegrationCardActions({
  integration,
  role,
}: IntegrationCardActionsProps) {
  const router = useRouter();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    status: string;
    message?: string;
  } | null>(null);

  const canEdit = role === 'OWNER' || role === 'ADMIN';
  const canDelete = role === 'OWNER';

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(`/api/admin/integrations/${integration.id}/test`, {
        method: 'POST',
      });
      const json = await res.json();
      setTestResult({
        ok: json.ok ?? res.ok,
        status: json.status || (res.ok ? 'CONNECTED' : 'ERROR'),
        message: json.message || (res.ok ? 'Kết nối thành công!' : 'Kiểm tra thất bại.'),
      });
      router.refresh();
    } catch (err: any) {
      setTestResult({
        ok: false,
        status: 'ERROR',
        message: err.message || 'Lỗi mạng khi kiểm tra.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/integrations/${integration.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Không thể xoá kết nối.');
      }
      setIsDeleteOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi xoá kết nối.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mt-4 border-t border-[#F1F3F6] pt-3">
      {testResult && (
        <div
          className={`mb-3 flex items-start gap-2 rounded-lg p-2.5 text-xs ${
            testResult.ok
              ? 'border border-green-200 bg-green-50 text-green-800'
              : 'border border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {testResult.ok ? (
            <CheckCircle size={14} className="mt-0.5 flex-none text-green-600" />
          ) : (
            <XCircle size={14} className="mt-0.5 flex-none text-red-600" />
          )}
          <span className="flex-1 leading-relaxed">{testResult.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {canEdit && (
            <Button
              size="sm"
              variant="outline"
              icon={<Settings size={13} />}
              onClick={() => setIsConfigOpen(true)}
            >
              Cấu hình
            </Button>
          )}

          <Button
            size="sm"
            variant="secondary"
            icon={<RefreshCw size={13} className={testing ? 'animate-spin' : ''} />}
            loading={testing}
            onClick={handleTest}
          >
            Kiểm tra
          </Button>
        </div>

        {canDelete && (
          <Button
            size="sm"
            variant="ghost"
            icon={<Trash2 size={13} className="text-red-500" />}
            onClick={() => setIsDeleteOpen(true)}
            title="Xoá kết nối"
          >
            Xoá
          </Button>
        )}
      </div>

      <ConfigureIntegrationModal
        isOpen={isConfigOpen}
        integration={integration}
        onClose={() => setIsConfigOpen(false)}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`Xác nhận xoá kết nối: ${integration.name}`}
        description="Các tác vụ phụ thuộc vào kết nối này sẽ ngừng hoạt động. Bạn có chắc chắn muốn xoá vĩnh viễn?"
        confirmText="Xoá kết nối"
        tone="danger"
        loading={deleting}
      />
    </div>
  );
}
