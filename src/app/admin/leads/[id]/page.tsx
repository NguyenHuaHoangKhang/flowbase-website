import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLead, listGrants } from '@/server/repositories';
import { formatDateTime, formatDate } from '@/lib/format';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import AdminButton from '@/components/admin/AdminButton';

/**
 * Trang chi tiết lead.
 * TODO khi nối DB: form đổi trạng thái POST về PATCH /api/admin/leads/[id],
 * ghi Activity kiểu STATUS_CHANGE và một dòng AuditLog trong cùng transaction.
 */
export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await getLead(params.id);
  if (!lead) notFound();

  const grants = (await listGrants()).filter((g) => g.leadId === lead.id);

  const fields = [
    ['Email', lead.email],
    ['Điện thoại', lead.phone ?? '—'],
    ['Công ty', lead.company ?? '—'],
    ['Nguồn', lead.source],
    ['UTM source', lead.utmSource ?? '—'],
    ['Điểm', `${lead.score}/100`],
    ['Phụ trách', lead.ownerName ?? 'chưa gán'],
    ['Nhận lúc', formatDateTime(lead.createdAt)],
    ['Đã liên hệ', formatDateTime(lead.contactedAt)],
    ['Chuyển đổi', formatDateTime(lead.convertedAt)],
  ];

  return (
    <>
      <PageHeader
        title={lead.name}
        description={lead.company ?? undefined}
        actions={
          <>
            <AdminButton href={`mailto:${lead.email}`}>Gửi email</AdminButton>
            <AdminButton variant="primary">Tạo dự án từ lead</AdminButton>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge value={lead.status} />
        {lead.lostReason && (
          <span className="text-[13px] text-muted">Lý do mất: {lead.lostReason}</span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl border border-border bg-card p-5">
          <b className="mb-3 block text-[15px]">Nội dung gửi từ website</b>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#40454f]">{lead.message}</p>

          <b className="mb-3 mt-7 block text-[15px]">Dòng thời gian</b>
          <p className="text-sm text-muted">
            Chưa có hoạt động nào được ghi. Khi nối DB, mọi thay đổi trạng thái, email và ghi chú
            sẽ hiện ở đây từ bảng <code className="font-mono text-[12.5px]">activities</code>.
          </p>
        </section>

        <div className="flex flex-col gap-4">
          <section className="rounded-xl border border-border bg-card p-5">
            <b className="mb-3 block text-[15px]">Thông tin</b>
            <dl className="grid gap-2 text-sm">
              {fields.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 border-b border-[#F1F3F6] pb-2 last:border-0 last:pb-0">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <b className="mb-3 block text-[15px]">Demo đã chia sẻ</b>
            {grants.length === 0 ? (
              <p className="text-sm text-muted">
                Chưa chia sẻ demo nào. Cấp quyền ở trang{' '}
                <Link href="/admin/demos" className="font-semibold text-primary">Demo</Link>.
              </p>
            ) : (
              <ul className="flex flex-col gap-2.5 text-sm">
                {grants.map((g) => (
                  <li key={g.id} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate">{g.demoTitle}</span>
                    <span className="flex-none text-[12.5px] text-muted">
                      {g.viewCount} lượt · hạn {formatDate(g.expiresAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
