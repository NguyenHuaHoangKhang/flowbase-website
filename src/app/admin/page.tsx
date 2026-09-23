import Link from 'next/link';
import { AlertTriangle, ArrowUpRight } from 'lucide-react';
import { dashboardStats, monthlyCashflow } from '@/server/repositories';
import { formatMoneyShort, formatDate, relativeTime, daysUntil } from '@/lib/format';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import StatusBadge from '@/components/admin/StatusBadge';
import AdminButton from '@/components/admin/AdminButton';

export default async function AdminDashboard() {
  const [stats, cashflow] = await Promise.all([dashboardStats(), monthlyCashflow()]);
  const max = Math.max(...cashflow.map((m) => Math.max(m.revenue, m.cost)));

  return (
    <>
      <PageHeader
        title="Tổng quan"
        description="Số liệu tổng hợp từ lead, dự án, tài chính và demo."
        actions={<AdminButton href="/admin/leads" variant="primary">Xem lead mới</AdminButton>}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Lead mới chưa xử lý" value={stats.newLeads} hint={`${stats.openLeads} lead đang mở`} tone={stats.newLeads > 0 ? 'warning' : 'default'} />
        <KpiCard label="Dự án đang chạy" value={stats.activeProjects} hint={`${stats.dueSoon.length} sắp đến hạn`} />
        <KpiCard label="Công nợ phải thu" value={formatMoneyShort(stats.finance.outstanding)} hint={`Quá hạn ${formatMoneyShort(stats.finance.overdue)}`} tone={stats.finance.overdue > 0 ? 'danger' : 'default'} />
        <KpiCard label="Đã thu" value={formatMoneyShort(stats.finance.collected)} hint={`Chi phí ${formatMoneyShort(stats.finance.expenses)}`} tone="success" />
      </div>


      {stats.brokenIntegrations > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/[0.08] px-4 py-3 text-sm">
          <AlertTriangle size={17} className="flex-none text-[#B45309]" />
          <span className="flex-1">
            {stats.brokenIntegrations} kết nối đang lỗi hoặc hết hạn.
          </span>
          <Link href="/admin/integrations" className="font-semibold text-primary">
            Kiểm tra →
          </Link>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-5 flex items-center justify-between">
            <b className="text-[15px]">Doanh thu và chi phí 6 tháng</b>
            <Link href="/admin/invoices" className="text-[13px] font-semibold text-primary">
              Chi tiết →
            </Link>
          </div>

          <div className="flex h-[180px] items-end gap-3">
            {cashflow.map((m) => (
              <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-full w-full items-end justify-center gap-1">
                  <div className="w-1/2 rounded-t bg-primary" style={{ height: `${(m.revenue / max) * 100}%` }} title={`Doanh thu ${formatMoneyShort(m.revenue)}`} />
                  <div className="w-1/2 rounded-t bg-[#E5E7EB]" style={{ height: `${(m.cost / max) * 100}%` }} title={`Chi phí ${formatMoneyShort(m.cost)}`} />
                </div>
                <span className="text-[11px] text-muted">{m.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-4 border-t border-border pt-3 text-[12px] text-muted">
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-primary" /> Doanh thu</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-[#E5E7EB]" /> Chi phí</span>
            <span className="ml-auto">Số liệu mẫu — nối DB để lấy số thật</span>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <b className="mb-4 block text-[15px]">Lead gần đây</b>
          <ul className="flex flex-col gap-3">
            {stats.recentLeads.map((lead) => (
              <li key={lead.id} className="flex items-start justify-between gap-3 border-b border-[#F1F3F6] pb-3 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <Link href={`/admin/leads/${lead.id}`} className="block truncate text-sm font-semibold hover:text-primary">
                    {lead.name}
                  </Link>
                  <span className="block truncate text-[12.5px] text-muted">
                    {lead.company ?? lead.email} · {relativeTime(lead.createdAt)}
                  </span>
                </div>
                <StatusBadge value={lead.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <b className="mb-4 block text-[15px]">Dự án sắp đến hạn</b>
          {stats.dueSoon.length === 0 ? (
            <p className="text-sm text-muted">Không có dự án nào đến hạn trong 14 ngày tới.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {stats.dueSoon.map((p) => {
                const days = daysUntil(p.dueDate);
                return (
                  <li key={p.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/admin/projects/${p.id}`} className="block truncate text-sm font-semibold hover:text-primary">
                        {p.title}
                      </Link>
                      <span className="font-mono text-[11.5px] text-muted">{p.code} · {formatDate(p.dueDate)}</span>
                    </div>
                    <span className={days !== null && days < 7 ? 'text-[13px] font-semibold text-[#B91C1C]' : 'text-[13px] text-muted'}>
                      {days !== null && days < 0 ? `trễ ${-days} ngày` : `còn ${days} ngày`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <b className="text-[15px]">Hoạt động hệ thống</b>
            <Link href="/admin/audit" className="text-[13px] font-semibold text-primary">
              Nhật ký <ArrowUpRight size={13} className="inline" />
            </Link>
          </div>
          <ul className="flex flex-col gap-2.5 text-[13px]">
            {stats.recentAudit.map((log) => (
              <li key={log.id} className="flex gap-2.5">
                <span className="w-[96px] flex-none truncate text-muted">{log.userName ?? 'Hệ thống'}</span>
                <span className="flex-1">{log.summary}</span>
                <span className="flex-none text-muted">{relativeTime(log.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
