import { notFound } from 'next/navigation';
import { getProject, listMilestones, listTasks, listInvoices, listExpenses } from '@/server/repositories';
import { formatMoney, formatMoneyShort, formatDate } from '@/lib/format';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import KpiCard from '@/components/admin/KpiCard';
import { Button } from '@/components/admin/ui';
import DataTable, { type Column } from '@/components/admin/DataTable';
import type { Invoice } from '@/lib/types';
import MilestoneSection from '@/components/admin/projects/MilestoneSection';
import TaskSection from '@/components/admin/projects/TaskSection';
import ProjectTimeline from '@/components/admin/projects/ProjectTimeline';

const invoiceColumns: Column<Invoice>[] = [
  { key: 'code', header: 'Mã', cell: (i) => <span className="font-mono text-[13px]">{i.code}</span> },
  { key: 'issue', header: 'Phát hành', cell: (i) => formatDate(i.issueDate) },
  { key: 'due', header: 'Hạn thu', cell: (i) => formatDate(i.dueDate) },
  { key: 'total', header: 'Tổng', align: 'right', cell: (i) => formatMoney(i.total, i.currency) },
  { key: 'paid', header: 'Đã thu', align: 'right', cell: (i) => formatMoney(i.amountPaid, i.currency) },
  { key: 'status', header: 'Trạng thái', cell: (i) => <StatusBadge value={i.status} /> },
];

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id);
  if (!project) notFound();

  const [milestones, tasks, invoices, expenses] = await Promise.all([
    listMilestones(project.id),
    listTasks(project.id),
    listInvoices(),
    listExpenses(),
  ]);

  const projectInvoices = invoices.data.filter((i) => i.projectId === project.id);
  const projectExpenses = expenses.data.filter((e) => e.projectId === project.id);
  const cost = projectExpenses.reduce((s, e) => s + e.amount, 0);
  const margin = project.paidAmount - cost;
  
  const totalAllocated = milestones.reduce((sum, m) => sum + m.amount, 0);

  return (
    <>
      <PageHeader
        title={project.title}
        description={`${project.code} · ${project.clientName ?? 'Chưa gán khách hàng'}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary">Ghi nhận chi phí</Button>
            <Button variant="primary">Xuất hoá đơn</Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge value={project.status} />
        <StatusBadge value={project.priority} />
        <span className="text-[13px] text-muted">
          {project.billingType} · phụ trách {project.ownerName ?? 'chưa gán'}
        </span>
      </div>

      {project.summary && (
        <div className="mb-5 rounded-xl border border-border bg-card p-4">
          <h3 className="mb-2 font-medium">Mô tả công việc</h3>
          <p className="text-[14px] text-muted whitespace-pre-wrap">{project.summary}</p>
        </div>
      )}

      <div className="mb-5 flex items-center gap-6 text-[13px] text-muted rounded-xl border border-border bg-card p-4">
        <div>
          <span className="block font-medium text-foreground mb-1">Ngày bắt đầu</span>
          {project.startDate ? formatDate(project.startDate) : 'Chưa xác định'}
        </div>
        <div>
          <span className="block font-medium text-foreground mb-1">Hạn kết thúc</span>
          {project.dueDate ? formatDate(project.dueDate) : 'Chưa xác định'}
        </div>
      </div>

      <div className="mb-5">
        <ProjectTimeline
          startDate={project.startDate}
          dueDate={project.dueDate}
          milestones={milestones}
          tasks={tasks}
        />
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Ngân sách" value={formatMoneyShort(project.budgetAmount, project.currency)} />
        <KpiCard label="Đã xuất hoá đơn" value={formatMoneyShort(project.invoicedAmount, project.currency)} />
        <KpiCard label="Đã thu" value={formatMoneyShort(project.paidAmount, project.currency)} tone="success" />
        <KpiCard
          label="Lãi gộp tạm tính"
          value={formatMoneyShort(margin, project.currency)}
          hint={`Chi phí ${formatMoneyShort(cost)}`}
          tone={margin < 0 ? 'danger' : 'default'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <MilestoneSection 
            projectId={project.id} 
            budgetAmount={project.budgetAmount} 
            totalAllocated={totalAllocated} 
          />
          <ul className="flex flex-col gap-3">
            {milestones.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 border-b border-[#F1F3F6] pb-3 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <b className="block truncate text-sm">{m.title}</b>
                  <span className="text-[12.5px] text-muted">Hạn {formatDate(m.dueDate)}</span>
                </div>
                <div className="flex flex-none items-center gap-3">
                  <span className="text-sm tabular-nums">{formatMoneyShort(m.amount)}</span>
                  <StatusBadge value={m.status} />
                </div>
              </li>
            ))}
            {milestones.length === 0 && <p className="text-sm text-muted">Chưa chia mốc.</p>}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <TaskSection projectId={project.id} tasks={tasks as any} />
        </section>
      </div>

      <section className="mt-5">
        <b className="mb-3 block text-[15px]">Hoá đơn của dự án</b>
        <DataTable
          columns={invoiceColumns}
          rows={projectInvoices}
          rowHref={(i) => `/admin/invoices/${i.id}`}
          empty={{ title: 'Chưa xuất hoá đơn nào cho dự án này' }}
        />
      </section>
    </>
  );
}
