import Link from 'next/link';
import { redirect } from 'next/navigation';
import { listDemos, listGrants, demosSummary } from '@/server/repositories';
import { formatDate, relativeTime } from '@/lib/format';
import type { Demo } from '@/lib/types';
import { getCurrentUser } from '@/lib/session';
import { canAccess } from '@/lib/rbac';
import {
  PageHeader,
  Toolbar,
  DataTable,
  StatusBadge,
  KpiCard,
  type Column,
} from '@/components/admin/ui';
import DemoActions from '@/components/admin/demos/DemoActions';
import DemoRowActions from '@/components/admin/demos/DemoRowActions';
import GrantsList from '@/components/admin/demos/GrantsList';

export default async function DemosPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; label?: string };
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !canAccess(currentUser.role, 'demo')) {
    redirect('/admin');
  }

  const [result, grants, summary] = await Promise.all([
    listDemos({
      q: searchParams.q,
      status: searchParams.status,
      label: searchParams.label,
    }),
    listGrants(),
    demosSummary(),
  ]);

  const columns: Column<Demo>[] = [
    {
      key: 'title',
      header: 'Tên Demo',
      cell: (d) => (
        <div>
          <div className="font-semibold text-ink">{d.title}</div>
          <div className="text-[12px] text-muted">{d.category}</div>
        </div>
      ),
    },
    {
      key: 'slug',
      header: 'Đường dẫn (Slug)',
      cell: (d) => (
        <code className="rounded bg-[#F3F5F8] px-1.5 py-0.5 font-mono text-[12px] text-[#4b515c]">
          /{d.slug}
        </code>
      ),
    },
    { key: 'label', header: 'Nhãn', cell: (d) => <StatusBadge value={d.label} /> },
    { key: 'status', header: 'Trạng thái', cell: (d) => <StatusBadge value={d.status} /> },
    { key: 'visibility', header: 'Bảo mật', cell: (d) => <StatusBadge value={d.visibility} /> },
    {
      key: 'views',
      header: 'Lượt xem',
      align: 'right',
      cell: (d) => <b className="font-mono text-[13px]">{d.viewCount.toLocaleString('vi-VN')}</b>,
    },
    {
      key: 'published',
      header: 'Xuất bản',
      cell: (d) => (
        <span className="text-xs text-muted">
          {d.publishedAt ? formatDate(d.publishedAt) : 'Chưa xuất bản'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      cell: (d) => <DemoRowActions demo={d} role={currentUser.role} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Quản Lý Demo & Portfolio"
        description="Quản lý danh mục các sản phẩm mẫu của FLOWBASE, cấu hình chế độ bảo vệ mật khẩu và cấp link xem riêng kèm token bảo mật."
        actions={<DemoActions role={currentUser.role} />}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Tổng số Demo" value={summary.totalDemos} />
        <KpiCard label="Đã xuất bản" value={summary.publishedDemos} tone="success" />
        <KpiCard label="Tổng lượt xem" value={summary.totalViews.toLocaleString('vi-VN')} />
        <KpiCard label="Quyền xem riêng hiệu lực" value={summary.activeGrants} tone="warning" />
      </div>

      <Toolbar
        action="/admin/demos"
        placeholder="Tìm theo tên, slug, danh mục..."
        defaultQuery={searchParams.q}
        filters={[
          {
            name: 'status',
            value: searchParams.status,
            options: [
              { value: '', label: 'Mọi trạng thái' },
              { value: 'DRAFT', label: 'Bản nháp (DRAFT)' },
              { value: 'PUBLISHED', label: 'Đã xuất bản (PUBLISHED)' },
              { value: 'ARCHIVED', label: 'Lưu trữ (ARCHIVED)' },
            ],
          },
          {
            name: 'label',
            value: searchParams.label,
            options: [
              { value: '', label: 'Mọi nhãn' },
              { value: 'CONCEPT', label: 'CONCEPT' },
              { value: 'DEMO', label: 'DEMO' },
              { value: 'PROTOTYPE', label: 'PROTOTYPE' },
              { value: 'CASE_STUDY', label: 'CASE STUDY' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        rows={result.data}
        empty={{
          title: 'Chưa có bản demo nào',
          description: 'Nhấn nút "Thêm demo" phía trên để tạo bản demo sản phẩm đầu tiên.',
        }}
      />

      <GrantsList grants={grants} role={currentUser.role} />

      <p className="mt-8 rounded-xl border border-dashed border-border bg-card px-5 py-4 text-[13px] text-muted">
        Trang public xem demo được bảo mật và theo dõi lượt xem tại đường dẫn <code className="font-mono">/demo/[slug]</code>.
        Thử nghiệm truy cập demo: <Link href="/demo/lecturer-management" className="font-semibold text-primary hover:underline">/demo/lecturer-management →</Link>
      </p>
    </>
  );
}
