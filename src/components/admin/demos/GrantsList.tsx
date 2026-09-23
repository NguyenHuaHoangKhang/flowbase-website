'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, Eye, Link2, Lock, Plus, ShieldAlert, ShieldX } from 'lucide-react';
import { Button, ConfirmDialog, StatusBadge } from '@/components/admin/ui';
import { formatDate } from '@/lib/format';
import CreateGrantModal from './CreateGrantModal';
import type { DemoAccessGrant, UserRole } from '@/lib/types';

interface GrantsListProps {
  grants: DemoAccessGrant[];
  role: UserRole;
}

export default function GrantsList({ grants, role }: GrantsListProps) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<DemoAccessGrant | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const canManage = role === 'OWNER' || role === 'ADMIN' || role === 'EDITOR';

  const handleCopy = (grant: DemoAccessGrant) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/demo/${grant.demoId}?t=${grant.token}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(grant.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      const res = await fetch(`/api/admin/demos/grants/${revokeTarget.id}/revoke`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error('Không thể thu hồi quyền xem.');
      }
      setRevokeTarget(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi thu hồi quyền truy cập.');
    } finally {
      setRevoking(false);
    }
  };

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-ink">Quyền xem riêng cho từng khách</h2>
          <p className="mt-0.5 text-xs text-muted">
            Link chứa token bảo mật gửi riêng cho từng đối tác. Dùng cho demo đặt ở chế độ <i>Chỉ người được cấp</i> (GRANT_ONLY) hoặc <i>Bảo vệ mật khẩu</i>.
          </p>
        </div>
        {canManage && (
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus size={14} />}
            onClick={() => setIsCreateOpen(true)}
          >
            Cấp quyền mới
          </Button>
        )}
      </div>

      {grants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted">
          Chưa có quyền xem riêng nào được cấp. Hãy nhấn &ldquo;Cấp quyền mới&rdquo; để sinh link bảo mật cho khách hàng.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {grants.map((g) => {
            const isRevoked = Boolean(g.revokedAt);
            const isExpired = g.expiresAt ? new Date(g.expiresAt) < new Date() : false;
            const isExhausted = g.maxViews !== null && g.viewCount >= g.maxViews;

            let statusValue = 'CONNECTED';
            let statusLabel = 'Đang hiệu lực';

            if (isRevoked) {
              statusValue = 'DISCONNECTED';
              statusLabel = 'Đã thu hồi';
            } else if (isExpired) {
              statusValue = 'EXPIRED';
              statusLabel = 'Đã hết hạn';
            } else if (isExhausted) {
              statusValue = 'OVERDUE';
              statusLabel = 'Hết lượt xem';
            }

            const isCopied = copiedId === g.id;

            return (
              <div
                key={g.id}
                className={`flex flex-col justify-between rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm ${
                  isRevoked ? 'border-dashed border-[#E0E2E7] opacity-60' : 'border-border'
                }`}
              >
                <div>
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <b className="truncate text-sm text-ink">{g.demoTitle}</b>
                    <StatusBadge value={statusValue} />
                  </div>

                  <p className="truncate font-mono text-xs text-muted">{g.email}</p>

                  <div className="mt-3 flex flex-wrap gap-3 border-t border-[#F1F3F6] pt-3 text-[12px] text-muted">
                    <span className="flex items-center gap-1">
                      <Eye size={13} className="text-muted" />
                      <b>{g.viewCount}</b>
                      {g.maxViews !== null ? `/${g.maxViews}` : ''} lượt
                    </span>
                    <span className="flex items-center gap-1">
                      <Lock size={13} className="text-muted" />
                      hạn {g.expiresAt ? formatDate(g.expiresAt) : 'Vô thời hạn'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 border-t border-[#F1F3F6] pt-3">
                  <div className="flex items-center gap-1.5">
                    <code className="flex flex-1 items-center gap-1.5 truncate rounded-md bg-[#F3F5F8] px-2 py-1.5 font-mono text-[11.5px] text-[#4b515c]">
                      <Link2 size={12} className="flex-none text-muted" />
                      /demo/{g.demoId}?t={g.token}
                    </code>
                    {!isRevoked && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(g)}
                        title="Sao chép link chia sẻ"
                      >
                        {isCopied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                      </Button>
                    )}
                  </div>

                  {canManage && !isRevoked && (
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setRevokeTarget(g)}
                        className="text-[11.5px] text-red-500 hover:text-red-600 hover:underline"
                      >
                        Thu hồi quyền
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateGrantModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <ConfirmDialog
        isOpen={Boolean(revokeTarget)}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        title={`Thu hồi quyền xem của ${revokeTarget?.email}`}
        description={`Sau khi thu hồi, link chứa token "${revokeTarget?.token}" sẽ bị vô hiệu hoá ngay lập tức. Khách hàng sẽ không thể truy cập bản demo được nữa.`}
        confirmText="Thu hồi quyền"
        tone="danger"
        loading={revoking}
      />
    </section>
  );
}
