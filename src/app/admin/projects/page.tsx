import Link from 'next/link';
import { listProjects, projectBoard } from '@/server/repositories';
import { formatMoneyShort, formatDate, daysUntil } from '@/lib/format';
import type { Project, ProjectStatus } from '@/lib/types';
import { getCurrentUser } from '@/lib/session';
import PageHeader from '@/components/admin/PageHeader';
import Toolbar from '@/components/admin/Toolbar';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { Button } from '@/components/admin/ui';
import ProjectActions from '@/components/admin/projects/ProjectActions';
import KanbanBoard from '@/components/admin/projects/KanbanBoard';

const columns: Column<Project>[] = [
  { key: 'title', header: 'Dự án', cell: (p) => p.title },
  { key: 'code', header: 'Mã', cell: (p) => <span className="font-mono text-[12.5px] text-muted">{p.code}</span> },
  { key: 'client', header: 'Khách hàng', cell: (p) => p.clientName ?? '—' },
  { key: 'status', header: 'Trạng thái', cell: (p) => <StatusBadge value={p.status} /> },
  { key: 'priority', header: 'Ưu tiên', cell: (p) => <StatusBadge value={p.priority} /> },
  { key: 'budget', header: 'Ngân sách', align: 'right', cell: (p) => formatMoneyShort(p.budgetAmount, p.currency) },
  { key: 'invoiced', header: 'Đã xuất HĐ', align: 'right', cell: (p) => formatMoneyShort(p.invoicedAmount, p.currency) },
  {
    key: 'progress',
    header: 'Tiến độ',
    cell: (p) => (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#F1F3F6]">
          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, p.progress))}%` }} />
        </div>
        <span className="text-[12px] text-muted">{p.progress}%</span>
      </div>
    ),
  },
  {
    key: 'due',
    header: 'Hạn',
    cell: (p) => {
      const d = daysUntil(p.dueDate);
      if (d === null) return <span className="text-muted">—</span>;
      return (
        <span className={d < 7 ? 'font-semibold text-[#B91C1C]' : 'text-muted'}>
          {formatDate(p.dueDate)}
        </span>
      );
    },
  },
];

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; view?: string };
}) {
  const [currentUser, result, board] = await Promise.all([
    getCurrentUser(),
    listProjects({ q: searchParams.q, status: searchParams.status as ProjectStatus | undefined }),
    projectBoard(),
  ]);

  const isBoard = searchParams.view !== 'table';
  const role = currentUser?.role ?? 'VIEWER';

  return (
    <>
      <PageHeader
        title="Dự án"
        description="Pipeline từ lúc tiếp nhận đến khi bàn giao. Kéo thả thẻ để cập nhật trạng thái trong thời gian thực."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              href={isBoard ? '/admin/projects?view=table' : '/admin/projects'}
            >
              {isBoard ? 'Xem dạng bảng' : 'Xem dạng board'}
            </Button>
            <ProjectActions role={role} />
          </div>
        }
      />

      {isBoard ? (
        <KanbanBoard initialBoard={board} userRole={role} />
      ) : (
        <>
          <Toolbar
            action="/admin/projects"
            placeholder="Tìm theo tên, mã, khách hàng…"
            defaultQuery={searchParams.q}
          >
            <input type="hidden" name="view" value="table" />
          </Toolbar>
          <DataTable
            columns={columns}
            rows={result.data}
            rowHref={(p) => `/admin/projects/${p.id}`}
            empty={{ title: 'Chưa có dự án nào' }}
          />
        </>
      )}
    </>
  );
}
