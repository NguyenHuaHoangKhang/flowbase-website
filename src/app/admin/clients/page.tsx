import { listClients } from '@/server/repositories';
import { getCurrentUser } from '@/lib/session';
import { formatMoney, formatDate } from '@/lib/format';
import type { Client } from '@/lib/types';
import { PageHeader, Toolbar, DataTable, StatusBadge, type Column } from '@/components/admin/ui';
import ClientActions from './ClientActions';

const columns: Column<Client>[] = [
  { key: 'name', header: 'Khách hàng', cell: (c) => <span className="font-semibold text-ink">{c.name}</span> },
  { key: 'tax', header: 'Mã số thuế', cell: (c) => <span className="font-mono text-[12.5px] text-muted">{c.taxCode ?? '—'}</span> },
  { key: 'status', header: 'Trạng thái', cell: (c) => <StatusBadge value={c.status} /> },
  { key: 'email', header: 'Email', cell: (c) => <span className="text-muted">{c.email ?? '—'}</span> },
  { key: 'projects', header: 'Dự án', align: 'right', cell: (c) => c.projectCount },
  { key: 'billed', header: 'Đã xuất HĐ', align: 'right', cell: (c) => formatMoney(c.totalBilled) },
  { key: 'outstanding', header: 'Công nợ', align: 'right', cell: (c) => (c.outstanding > 0 ? <b className="text-[#B91C1C]">{formatMoney(c.outstanding)}</b> : formatMoney(0)) },
  { key: 'created', header: 'Tạo lúc', cell: (c) => <span className="text-muted">{formatDate(c.createdAt)}</span> },
];

export default async function ClientsPage({ searchParams }: { searchParams: { q?: string } }) {
  const [user, result] = await Promise.all([
    getCurrentUser(),
    listClients({ q: searchParams.q }),
  ]);

  return (
    <>
      <PageHeader
        title="Khách hàng"
        description="Lead sau khi chốt được chuyển thành khách hàng. Hoá đơn và hợp đồng luôn gắn vào đây, không gắn trực tiếp vào lead."
        actions={user ? <ClientActions role={user.role} /> : undefined}
      />
      <Toolbar action="/admin/clients" placeholder="Tìm theo tên, MST, email…" defaultQuery={searchParams.q} />
      <DataTable
        columns={columns}
        rows={result.data}
        empty={{ title: 'Chưa có khách hàng nào', description: 'Bấm "Thêm khách hàng" hoặc chuyển từ lead để bắt đầu.' }}
      />
    </>
  );
}
