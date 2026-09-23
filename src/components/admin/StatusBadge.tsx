import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'muted';

const tones: Record<Tone, string> = {
  neutral: 'bg-[#F1F3F6] text-[#4b515c] border-[#E5E7EB]',
  info: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-success/[0.12] text-[#15803D] border-success/25',
  warning: 'bg-[#F59E0B]/[0.14] text-[#B45309] border-[#F59E0B]/25',
  danger: 'bg-[#EF4444]/[0.12] text-[#B91C1C] border-[#EF4444]/25',
  muted: 'bg-transparent text-muted border-border',
};

/** Ánh xạ mọi enum trạng thái sang màu. Một chỗ duy nhất để đổi màu toàn admin. */
const map: Record<string, Tone> = {
  // Lead
  NEW: 'info', CONTACTED: 'neutral', QUALIFIED: 'info', PROPOSAL: 'warning',
  WON: 'success', LOST: 'danger', SPAM: 'muted',
  // Project
  BACKLOG: 'muted', DISCOVERY: 'neutral', SIGNED: 'info', IN_PROGRESS: 'info',
  UAT: 'warning', DELIVERED: 'success', MAINTENANCE: 'neutral',
  ON_HOLD: 'warning', CANCELLED: 'danger',
  // Invoice
  DRAFT: 'muted', SENT: 'info', PARTIAL: 'warning', PAID: 'success',
  OVERDUE: 'danger', VOID: 'muted',
  // Demo
  PUBLISHED: 'success', ARCHIVED: 'muted',
  PUBLIC: 'success', UNLISTED: 'neutral', PASSWORD: 'warning', GRANT_ONLY: 'info',
  CONCEPT: 'neutral', DEMO: 'info', PROTOTYPE: 'warning', CASE_STUDY: 'success',
  // Integration
  CONNECTED: 'success', DISCONNECTED: 'muted', ERROR: 'danger', EXPIRED: 'warning',
  // Milestone / task
  PLANNED: 'muted', DONE: 'success', INVOICED: 'info', TODO: 'muted',
  REVIEW: 'warning', BLOCKED: 'danger',
  // User
  ACTIVE: 'success', INVITED: 'warning', SUSPENDED: 'danger',
  // Priority
  LOW: 'muted', NORMAL: 'neutral', HIGH: 'warning', URGENT: 'danger',
};

const labels: Record<string, string> = {
  NEW: 'Mới', CONTACTED: 'Đã liên hệ', QUALIFIED: 'Tiềm năng', PROPOSAL: 'Đã báo giá',
  WON: 'Chốt', LOST: 'Mất', SPAM: 'Spam',
  IN_PROGRESS: 'Đang làm', ON_HOLD: 'Tạm dừng', CANCELLED: 'Huỷ',
  DELIVERED: 'Đã bàn giao', PARTIAL: 'Thu một phần', PAID: 'Đã thu',
  OVERDUE: 'Quá hạn', DRAFT: 'Nháp', SENT: 'Đã gửi', VOID: 'Huỷ bỏ',
  CONNECTED: 'Đang kết nối', DISCONNECTED: 'Chưa nối', ERROR: 'Lỗi', EXPIRED: 'Hết hạn',
  ACTIVE: 'Hoạt động', INVITED: 'Đã mời', SUSPENDED: 'Đã khoá',
};

export default function StatusBadge({ value, className }: { value: string; className?: string }) {
  const tone = map[value] ?? 'neutral';
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 text-[11.5px] font-semibold',
        tones[tone],
        className,
      )}
    >
      {labels[value] ?? value.replace(/_/g, ' ').toLowerCase()}
    </span>
  );
}
