import { notFound, redirect } from 'next/navigation';
import { getInvoice, listPayments } from '@/server/repositories';
import { formatMoney, formatDate } from '@/lib/format';
import { getCurrentUser } from '@/lib/session';
import { canAccess } from '@/lib/rbac';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { Button } from '@/components/admin/ui';
import InvoicePaymentAction from '@/components/admin/invoices/InvoicePaymentAction';

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !canAccess(currentUser.role, 'invoice')) {
    redirect('/admin');
  }

  const invoice = await getInvoice(params.id);
  if (!invoice) notFound();

  const payments = await listPayments(invoice.id);
  const remaining = invoice.total - invoice.amountPaid;

  const lines = [
    ['Tiền hàng', formatMoney(invoice.subtotal, invoice.currency)],
    ['Chiết khấu', `- ${formatMoney(invoice.discount, invoice.currency)}`],
    [`Thuế (${invoice.taxRate}%)`, formatMoney(invoice.taxAmount, invoice.currency)],
  ];

  return (
    <>
      <PageHeader
        title={invoice.code}
        description={`${invoice.clientName}${invoice.projectCode ? ` · ${invoice.projectCode}` : ''}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary">Xuất PDF</Button>
            <InvoicePaymentAction invoice={invoice} role={currentUser.role} />
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <StatusBadge value={invoice.status} />
        <span className="text-[13px] text-muted">
          Phát hành {formatDate(invoice.issueDate)} · hạn thu {formatDate(invoice.dueDate)}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl border border-border bg-card p-5">
          <b className="mb-4 block text-[15px]">Chi tiết hoá đơn</b>
          <p className="mb-4 text-sm text-muted">
            Dòng hoá đơn được liên kết trong bảng <code className="font-mono text-[12.5px]">invoice_items</code>.
            Ràng buộc kiểm tra <code className="font-mono text-[12.5px]">chk_invoice_item_amount</code> bảo đảm
            tính toán khớp 100% giữa các dòng và tổng hoá đơn.
          </p>

          <dl className="grid gap-2 border-t border-border pt-4 text-sm">
            {lines.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3">
                <dt className="text-muted">{label}</dt>
                <dd className="tabular-nums">{value}</dd>
              </div>
            ))}
            <div className="mt-2 flex justify-between gap-3 border-t border-border pt-3 text-[15px] font-bold">
              <dt>Tổng cộng</dt>
              <dd className="tabular-nums">{formatMoney(invoice.total, invoice.currency)}</dd>
            </div>
            <div className="flex justify-between gap-3 text-sm">
              <dt className="text-muted">Đã thu</dt>
              <dd className="tabular-nums text-[#15803D]">{formatMoney(invoice.amountPaid, invoice.currency)}</dd>
            </div>
            <div className="flex justify-between gap-3 text-sm font-semibold">
              <dt>Còn lại</dt>
              <dd className={remaining > 0 ? 'tabular-nums text-[#B91C1C]' : 'tabular-nums'}>
                {formatMoney(remaining, invoice.currency)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <b className="mb-4 block text-[15px]">Lịch sử thanh toán ({payments.length})</b>
          {payments.length === 0 ? (
            <p className="text-sm text-muted">Chưa ghi nhận khoản thu nào.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {payments.map((p) => (
                <li key={p.id} className="border-b border-[#F1F3F6] pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between gap-3">
                    <b className="text-sm tabular-nums text-foreground">{formatMoney(p.amount, p.currency)}</b>
                    <span className="text-[12.5px] text-muted">{formatDate(p.paidAt)}</span>
                  </div>
                  <span className="text-[12.5px] text-muted">
                    {p.method} {p.reference ? `· Mã GD: ${p.reference}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
