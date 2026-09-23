import { listLeads, leadStatusCounts } from '@/server/repositories';
import { getCurrentUser } from '@/lib/session';
import { formatDate, relativeTime } from '@/lib/format';
import type { Lead, LeadStatus } from '@/lib/types';
import {
  PageHeader,
  Toolbar,
  DataTable,
  StatusBadge,
  KpiCard,
  type Column,
} from '@/components/admin/ui';
import LeadActions from './LeadActions';

const statusOptions = [
  { value: '', label: 'Mọi trạng thái' },
  { value: 'NEW', label: 'Mới' },
  { value: 'CONTACTED', label: 'Đã liên hệ' },
  { value: 'QUALIFIED', label: 'Tiềm năng' },
  { value: 'PROPOSAL', label: 'Đã báo giá' },
  { value: 'WON', label: 'Chốt' },
  { value: 'LOST', label: 'Mất' },
  { value: 'SPAM', label: 'Spam' },
];

const columns: Column<Lead>[] = [
  { key: 'name', header: 'Người liên hệ', cell: (l) => <span className="font-semibold text-ink">{l.name}</span> },
  { key: 'company', header: 'Công ty', cell: (l) => l.company ?? '—' },
  { key: 'email', header: 'Email', cell: (l) => <span className="text-muted">{l.email}</span> },
  { key: 'source', header: 'Nguồn', cell: (l) => <span className="font-mono text-[12px] text-muted">{l.source.toLowerCase()}</span> },
  { key: 'score', header: 'Điểm', align: 'right', cell: (l) => l.score },
  { key: 'status', header: 'Trạng thái', cell: (l) => <StatusBadge value={l.status} /> },
  { key: 'owner', header: 'Phụ trách', cell: (l) => l.ownerName ?? <span className="text-muted">chưa gán</span> },
  { key: 'createdAt', header: 'Nhận lúc', cell: (l) => <span className="text-muted">{relativeTime(l.createdAt)}</span> },
];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const [user, result, counts] = await Promise.all([
    getCurrentUser(),
    listLeads({ q: searchParams.q, status: searchParams.status as LeadStatus | undefined }),
    leadStatusCounts(),
  ]);

  return (
    <>
      <PageHeader
        title="Liên hệ / Lead"
        description="Mọi request gửi từ form Contact trên website hoặc tạo thủ công đổ về đây."
        actions={user ? <LeadActions role={user.role} /> : undefined}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Mới" value={counts.NEW ?? 0} tone="warning" />
        <KpiCard label="Đang theo" value={(counts.CONTACTED ?? 0) + (counts.QUALIFIED ?? 0) + (counts.PROPOSAL ?? 0)} />
        <KpiCard label="Đã chốt" value={counts.WON ?? 0} tone="success" />
        <KpiCard label="Spam đã lọc" value={counts.SPAM ?? 0} />
      </div>

      <Toolbar
        action="/admin/leads"
        placeholder="Tìm theo tên, email, công ty…"
        defaultQuery={searchParams.q}
        filters={[{ name: 'status', value: searchParams.status, options: statusOptions }]}
      />

      <DataTable
        columns={columns}
        rows={result.data}
        rowHref={(l) => `/admin/leads/${l.id}`}
        empty={{
          title: 'Chưa có lead nào khớp bộ lọc',
          description: 'Bấm "Tạo cơ hội" để thêm lead mới hoặc chờ request từ form Contact.',
        }}
      />

      <p className="mt-3 text-[12.5px] text-muted">
        {result.total} bản ghi · trang {result.page}
      </p>
    </>
  );
}
