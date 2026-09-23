import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/format';
import { PageHeader, Toolbar, DataTable, type Column } from '@/components/admin/ui';
import MessageTemplateActions from './MessageTemplateActions';
import MessageTemplateRowActions from './MessageTemplateRowActions';

const columns: Column<any>[] = [
  { key: 'name', header: 'Tên mẫu', cell: (c) => <span className="font-semibold text-ink">{c.name}</span> },
  { key: 'category', header: 'Lĩnh vực', cell: (c) => <span className="text-muted">{c.category}</span> },
  { key: 'channel', header: 'Kênh', cell: (c) => (
      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[12px] font-semibold text-primary">
        {c.channel}
      </span>
  )},
  { key: 'updated', header: 'Cập nhật', cell: (c) => <span className="text-muted">{formatDate(c.updatedAt)}</span> },
  { key: 'actions', header: '', align: 'right', cell: (c) => <MessageTemplateRowActions template={c} /> },
];

export default async function MessageTemplatesPage({ searchParams }: { searchParams: { q?: string } }) {
  const [user, templates] = await Promise.all([
    getCurrentUser(),
    prisma.messageTemplate.findMany({
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
        title="Mẫu tin nhắn"
        description="Quản lý các mẫu nội dung để nhắn tin nhanh qua Zalo, Email, thu thập thông tin khách hàng."
        actions={user ? <MessageTemplateActions role={user.role} /> : undefined}
      />
      <Toolbar action="/admin/message-templates" placeholder="Tìm mẫu..." defaultQuery={searchParams.q} />
      <DataTable
        columns={columns}
        rows={templates}
        empty={{ title: 'Chưa có mẫu nào', description: 'Bấm "Tạo mẫu" để bắt đầu.' }}
      />
    </>
  );
}
