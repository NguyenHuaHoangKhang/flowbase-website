import { redirect } from 'next/navigation';
import { listAuditLogs } from '@/server/repositories';
import { formatDateTime } from '@/lib/format';
import type { AuditLog } from '@/lib/types';
import { getCurrentUser } from '@/lib/session';
import { canAccess } from '@/lib/rbac';
import { PageHeader, Toolbar, DataTable, StatusBadge, type Column } from '@/components/admin/ui';

const columns: Column<AuditLog>[] = [
  {
    key: 'time',
    header: 'Thời điểm',
    cell: (a) => (
      <span className="whitespace-nowrap font-mono text-[12px] text-muted">
        {formatDateTime(a.createdAt)}
      </span>
    ),
  },
  {
    key: 'user',
    header: 'Người thực hiện',
    cell: (a) => (
      <span className="font-medium text-ink">
        {a.userName ?? 'Hệ thống (System)'}
      </span>
    ),
  },
  {
    key: 'action',
    header: 'Hành động',
    cell: (a) => {
      let toneClass = 'bg-[#F1F3F6] text-[#4b515c] border-[#E5E7EB]';
      if (a.action === 'DELETE' || a.action === 'REVOKE_ACCESS') {
        toneClass = 'bg-[#EF4444]/[0.12] text-[#B91C1C] border-[#EF4444]/25';
      } else if (a.action === 'CREATE' || a.action === 'GRANT_ACCESS') {
        toneClass = 'bg-success/[0.12] text-[#15803D] border-success/25';
      } else if (a.action === 'UPDATE') {
        toneClass = 'bg-primary/10 text-primary border-primary/20';
      }
      return (
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wide ${toneClass}`}>
          {a.action}
        </span>
      );
    },
  },
  {
    key: 'entity',
    header: 'Đối tượng',
    cell: (a) => (
      <div className="font-mono text-[12px]">
        <span className="font-semibold text-ink">{a.entityType}</span>
        {a.entityId && <span className="ml-1 text-muted">#{a.entityId.slice(-8)}</span>}
      </div>
    ),
  },
  {
    key: 'summary',
    header: 'Nội dung tóm tắt',
    cell: (a) => <span className="text-sm text-ink">{a.summary ?? '—'}</span>,
  },
  {
    key: 'ip',
    header: 'Địa chỉ IP',
    cell: (a) => <span className="font-mono text-[11.5px] text-muted">{a.ip ?? '—'}</span>,
  },
];

export default async function AuditPage({
  searchParams,
}: {
  searchParams: { entityType?: string; action?: string; q?: string; page?: string };
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !canAccess(currentUser.role, 'audit')) {
    redirect('/admin');
  }

  const result = await listAuditLogs({
    entityType: searchParams.entityType,
    action: searchParams.action,
    q: searchParams.q,
    page: searchParams.page ? Number(searchParams.page) : 1,
  });

  return (
    <>
      <PageHeader
        title="Nhật Ký Kiểm Toán (Audit Logs)"
        description="Mọi thao tác thay đổi dữ liệu quan trọng đều được tự động lưu trữ bất biến (append-only) trong PostgreSQL để phục vụ tra cứu và kiểm toán."
      />

      <Toolbar
        action="/admin/audit"
        placeholder="Tìm theo nội dung, ID đối tượng, IP..."
        defaultQuery={searchParams.q}
        filters={[
          {
            name: 'entityType',
            value: searchParams.entityType,
            options: [
              { value: '', label: 'Mọi đối tượng' },
              { value: 'Lead', label: 'Lead' },
              { value: 'Project', label: 'Project (Dự án)' },
              { value: 'Invoice', label: 'Invoice (Hoá đơn)' },
              { value: 'Payment', label: 'Payment (Thanh toán)' },
              { value: 'Expense', label: 'Expense (Chi phí)' },
              { value: 'Demo', label: 'Demo / Portfolio' },
              { value: 'Integration', label: 'Integration (Kết nối)' },
              { value: 'WebhookEndpoint', label: 'Webhook Endpoint' },
            ],
          },
          {
            name: 'action',
            value: searchParams.action,
            options: [
              { value: '', label: 'Mọi hành động' },
              { value: 'CREATE', label: 'CREATE (Tạo mới)' },
              { value: 'UPDATE', label: 'UPDATE (Cập nhật)' },
              { value: 'DELETE', label: 'DELETE (Xoá)' },
              { value: 'GRANT_ACCESS', label: 'GRANT_ACCESS (Cấp quyền)' },
              { value: 'REVOKE_ACCESS', label: 'REVOKE_ACCESS (Thu hồi)' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        rows={result.data}
        empty={{
          title: 'Chưa có nhật ký nào',
          description: 'Các thao tác thêm, sửa, xoá trong hệ thống sẽ tự động xuất hiện tại đây.',
        }}
      />
    </>
  );
}
