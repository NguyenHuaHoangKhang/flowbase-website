import { redirect } from 'next/navigation';
import { listExpenses, financeSummary } from '@/server/repositories';
import { formatMoney, formatMoneyShort, formatDate } from '@/lib/format';
import type { Expense } from '@/lib/types';
import { getCurrentUser } from '@/lib/session';
import { canAccess } from '@/lib/rbac';
import PageHeader from '@/components/admin/PageHeader';
import Toolbar from '@/components/admin/Toolbar';
import DataTable, { type Column } from '@/components/admin/DataTable';
import KpiCard from '@/components/admin/KpiCard';
import ExpenseActions from '@/components/admin/expenses/ExpenseActions';

const categoryLabels: Record<string, string> = {
  INFRASTRUCTURE: 'Hạ tầng', SOFTWARE: 'Phần mềm', CONTRACTOR: 'Thuê ngoài',
  SALARY: 'Lương', MARKETING: 'Marketing', EQUIPMENT: 'Thiết bị', TAX: 'Thuế', OTHER: 'Khác',
};

const columns: Column<Expense>[] = [
  { key: 'vendor', header: 'Nhà cung cấp', cell: (e) => e.vendor },
  { key: 'category', header: 'Nhóm', cell: (e) => categoryLabels[e.category] ?? e.category },
  { key: 'description', header: 'Nội dung', cell: (e) => <span className="text-muted">{e.description ?? '—'}</span> },
  { key: 'project', header: 'Dự án', cell: (e) => <span className="font-mono text-[12.5px] text-muted">{e.projectCode ?? '—'}</span> },
  { key: 'billable', header: 'Tính cho KH', cell: (e) => (e.billable ? 'Có' : '—') },
  { key: 'recurrence', header: 'Lặp lại', cell: (e) => (e.recurrence === 'monthly' ? 'Hằng tháng' : e.recurrence === 'yearly' ? 'Hằng năm' : '—') },
  { key: 'spentAt', header: 'Ngày chi', cell: (e) => <span className="text-muted">{formatDate(e.spentAt)}</span> },
  { key: 'amount', header: 'Số tiền', align: 'right', cell: (e) => <b>{formatMoney(e.amount, e.currency)}</b> },
];

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !canAccess(currentUser.role, 'expense')) {
    redirect('/admin');
  }

  const [result, summary] = await Promise.all([
    listExpenses({ q: searchParams.q, category: searchParams.category }),
    financeSummary(),
  ]);

  return (
    <>
      <PageHeader
        title="Chi phí"
        description="Chi phí vận hành và chi phí gắn theo dự án. Khoản nào đánh dấu tính cho khách sẽ được gợi ý khi xuất hoá đơn."
        actions={<ExpenseActions role={currentUser.role} />}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Tổng chi" value={formatMoneyShort(summary.expenses)} />
        <KpiCard label="Chi phí cố định/tháng" value={formatMoneyShort(summary.recurringMonthly)} />
        <KpiCard label="Đã thu" value={formatMoneyShort(summary.collected)} tone="success" />
        <KpiCard
          label="Chênh lệch"
          value={formatMoneyShort(summary.net)}
          tone={summary.net < 0 ? 'danger' : 'success'}
          hint="Đã thu trừ tổng chi"
        />
      </div>

      <Toolbar
        action="/admin/expenses"
        placeholder="Tìm theo nhà cung cấp, nội dung…"
        defaultQuery={searchParams.q}
        filters={[
          {
            name: 'category',
            value: searchParams.category,
            options: [
              { value: '', label: 'Mọi nhóm' },
              ...Object.entries(categoryLabels).map(([value, label]) => ({ value, label })),
            ],
          },
        ]}
      />

      <DataTable columns={columns} rows={result.data} empty={{ title: 'Chưa ghi nhận chi phí nào' }} />
    </>
  );
}
