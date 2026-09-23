import { redirect } from 'next/navigation';
import { listInvoices, financeSummary } from '@/server/repositories';
import { formatMoney, formatMoneyShort, formatDate, daysUntil } from '@/lib/format';
import type { Invoice } from '@/lib/types';
import { getCurrentUser } from '@/lib/session';
import { canAccess } from '@/lib/rbac';
import PageHeader from '@/components/admin/PageHeader';
import Toolbar from '@/components/admin/Toolbar';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import KpiCard from '@/components/admin/KpiCard';
import InvoiceActions from '@/components/admin/invoices/InvoiceActions';

const columns: Column<Invoice>[] = [
  { key: 'code', header: 'Mã', cell: (i) => <span className="font-mono">{i.code}</span> },
  { key: 'client', header: 'Khách hàng', cell: (i) => i.clientName },
  { key: 'project', header: 'Dự án', cell: (i) => <span className="font-mono text-[12.5px] text-muted">{i.projectCode ?? '—'}</span> },
  { key: 'issue', header: 'Phát hành', cell: (i) => <span className="text-muted">{formatDate(i.issueDate)}</span> },
  {
    key: 'due',
    header: 'Hạn thu',
    cell: (i) => {
      const d = daysUntil(i.dueDate);
      const late = d !== null && d < 0 && i.status !== 'PAID';
      return <span className={late ? 'font-semibold text-[#B91C1C]' : 'text-muted'}>{formatDate(i.dueDate)}</span>;
    },
  },
  { key: 'total', header: 'Tổng', align: 'right', cell: (i) => formatMoney(i.total, i.currency) },
  { key: 'paid', header: 'Đã thu', align: 'right', cell: (i) => formatMoney(i.amountPaid, i.currency) },
  { key: 'due_amount', header: 'Còn lại', align: 'right', cell: (i) => <b>{formatMoney(i.total - i.amountPaid, i.currency)}</b> },
  { key: 'status', header: 'Trạng thái', cell: (i) => <StatusBadge value={i.status} /> },
];

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !canAccess(currentUser.role, 'invoice')) {
    redirect('/admin');
  }

  const [result, summary] = await Promise.all([
    listInvoices({ q: searchParams.q, status: searchParams.status }),
    financeSummary(),
  ]);

  return (
    <>
      <PageHeader
        title="Hoá đơn"
        description="Trạng thái hoá đơn được database tự động cập nhật theo payments qua trigger sync_invoice_payment_state."
        actions={<InvoiceActions role={currentUser.role} />}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Đã xuất hoá đơn" value={formatMoneyShort(summary.billed)} />
        <KpiCard label="Đã thu" value={formatMoneyShort(summary.collected)} tone="success" />
        <KpiCard label="Còn phải thu" value={formatMoneyShort(summary.outstanding)} tone="warning" />
        <KpiCard label="Quá hạn" value={formatMoneyShort(summary.overdue)} tone="danger" />
      </div>

      <Toolbar
        action="/admin/invoices"
        placeholder="Tìm theo mã, khách hàng, dự án…"
        defaultQuery={searchParams.q}
        filters={[
          {
            name: 'status',
            value: searchParams.status,
            options: [
              { value: '', label: 'Mọi trạng thái' },
              { value: 'DRAFT', label: 'Nháp' },
              { value: 'SENT', label: 'Đã gửi' },
              { value: 'PARTIAL', label: 'Thu một phần' },
              { value: 'PAID', label: 'Đã thu đủ' },
              { value: 'OVERDUE', label: 'Quá hạn' },
              { value: 'VOID', label: 'Huỷ bỏ' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        rows={result.data}
        rowHref={(i) => `/admin/invoices/${i.id}`}
        empty={{ title: 'Chưa có hoá đơn nào' }}
      />
    </>
  );
}
