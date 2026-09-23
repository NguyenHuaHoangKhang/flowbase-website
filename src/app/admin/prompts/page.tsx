import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/format';
import { PageHeader, Toolbar, DataTable, type Column } from '@/components/admin/ui';
import PromptActions from './PromptActions';
import PromptRowActions from './PromptRowActions';

const columns: Column<any>[] = [
  { key: 'name', header: 'Tên Prompt', cell: (c) => <span className="font-semibold text-ink">{c.name}</span> },
  { key: 'desc', header: 'Mô tả', cell: (c) => <span className="text-muted text-[13px]">{c.description || '—'}</span> },
  { key: 'tags', header: 'Phân loại', cell: (c) => (
      <div className="flex flex-wrap gap-1">
        {c.tags.map((t: string) => (
          <span key={t} className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[11px] font-mono border border-border text-muted">
            {t}
          </span>
        ))}
      </div>
  )},
  { key: 'updated', header: 'Cập nhật', cell: (c) => <span className="text-muted">{formatDate(c.updatedAt)}</span> },
  { key: 'actions', header: '', align: 'right', cell: (c) => <PromptRowActions prompt={c} /> },
];

export default async function PromptsPage({ searchParams }: { searchParams: { q?: string } }) {
  const [user, prompts] = await Promise.all([
    getCurrentUser(),
    prisma.prompt.findMany({
      where: {
        deletedAt: null,
        ...(searchParams.q ? { name: { contains: searchParams.q, mode: 'insensitive' } } : {}),
      },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="AI Studio"
        description="Quản lý và chạy các mẫu AI Prompts để tự động hóa quy trình phân tích và tạo form."
        actions={user ? <PromptActions role={user.role} /> : undefined}
      />
      <Toolbar action="/admin/prompts" placeholder="Tìm theo tên prompt..." defaultQuery={searchParams.q} />
      <DataTable
        columns={columns}
        rows={prompts}
        empty={{ title: 'Chưa có mẫu prompt nào', description: 'Bấm "Tạo prompt" để bắt đầu.' }}
      />
    </>
  );
}
