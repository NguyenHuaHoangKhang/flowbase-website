'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type LeadStatus } from '@/lib/types';
import StatusBadge from '@/components/admin/StatusBadge';

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'NEW', label: 'Mới' },
  { value: 'CONTACTED', label: 'Đã liên hệ' },
  { value: 'QUALIFIED', label: 'Tiềm năng' },
  { value: 'PROPOSAL', label: 'Báo giá' },
  { value: 'WON', label: 'Chốt deal' },
  { value: 'LOST', label: 'Thất bại' },
  { value: 'SPAM', label: 'Spam' },
];

export default function LeadStatusEditor({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: LeadStatus;
}) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  async function updateStatus(newStatus: LeadStatus) {
    if (newStatus === currentStatus) return;

    let payload: any = { status: newStatus };
    if (newStatus === 'LOST') {
      const reason = window.prompt('Vui lòng nhập lý do thất bại:');
      if (reason === null) return; // Bấm Cancel
      payload.lostReason = reason || 'Không rõ';
    }

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Cập nhật thất bại');
      } else {
        router.refresh();
      }
    } catch (e) {
      alert('Lỗi mạng, vui lòng thử lại.');
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="relative inline-flex items-center hover:opacity-80 transition-opacity">
      {isUpdating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded bg-white/50">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      )}
      <select
        value={currentStatus}
        onChange={(e) => updateStatus(e.target.value as LeadStatus)}
        disabled={isUpdating}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 z-20"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <StatusBadge value={currentStatus} />
      <div className="ml-2 text-[12.5px] text-muted font-medium">▼ Đổi</div>
    </div>
  );
}
