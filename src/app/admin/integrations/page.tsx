import { redirect } from 'next/navigation';
import { AlertCircle, CheckCircle2, Webhook } from 'lucide-react';
import { listIntegrations, listWebhooks, integrationsSummary } from '@/server/repositories';
import { relativeTime } from '@/lib/format';
import { WEBHOOK_EVENTS } from '@/lib/validators';
import { getCurrentUser } from '@/lib/session';
import { canAccess } from '@/lib/rbac';
import { PageHeader, StatusBadge, KpiCard } from '@/components/admin/ui';
import IntegrationsHeaderActions from '@/components/admin/integrations/IntegrationsHeaderActions';
import IntegrationCardActions from '@/components/admin/integrations/IntegrationCardActions';
import WebhookItemActions from '@/components/admin/integrations/WebhookItemActions';

const providerLabels: Record<string, string> = {
  SLACK: 'Slack',
  ZALO_OA: 'Zalo OA',
  GOOGLE_SHEETS: 'Google Sheets',
  GOOGLE_DRIVE: 'Google Drive',
  GITHUB: 'GitHub',
  VERCEL: 'Vercel',
  RESEND: 'Resend',
  SENDGRID: 'SendGrid',
  STRIPE: 'Stripe',
  GENERIC_WEBHOOK: 'Webhook',
};

export default async function IntegrationsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || !canAccess(currentUser.role, 'integration')) {
    redirect('/admin');
  }

  const [integrations, webhooks, summary] = await Promise.all([
    listIntegrations(),
    listWebhooks(),
    integrationsSummary(),
  ]);

  const broken = integrations.filter((i) => ['ERROR', 'EXPIRED'].includes(i.status));

  return (
    <>
      <PageHeader
        title="Kết Nối & Webhooks"
        description="Quản lý kết nối tới các nền tảng bên ngoài và cấu hình webhook phát sự kiện từ hệ thống FLOWBASE."
        actions={<IntegrationsHeaderActions role={currentUser.role} />}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Tổng kết nối" value={summary.total} />
        <KpiCard label="Đang hoạt động" value={summary.connected} tone="success" />
        <KpiCard label="Cảnh báo / Lỗi" value={summary.broken} tone="danger" />
        <KpiCard label="Webhook kích hoạt" value={summary.webhooksActive} tone="warning" />
      </div>

      {broken.length > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/[0.08] px-4 py-3 text-sm">
          <AlertCircle size={18} className="mt-0.5 flex-none text-[#B45309]" />
          <div>
            <b className="text-ink">{broken.length} kết nối cần xử lý cấu hình</b>
            <ul className="mt-1 list-inside list-disc text-xs text-[#8a6320]">
              {broken.map((i) => (
                <li key={i.id}>
                  <b>{providerLabels[i.provider] || i.provider}</b> ({i.name}) — {i.lastError ?? 'Không rõ nguyên nhân'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {integrations.map((i) => (
          <div key={i.id} className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs">
            <div>
              <div className="mb-2 flex items-start justify-between gap-2">
                <b className="text-[15px] text-ink">{providerLabels[i.provider] ?? i.provider}</b>
                <StatusBadge value={i.status} />
              </div>
              <p className="text-[13px] text-muted">{i.name}</p>

              <dl className="mt-4 grid gap-2 border-t border-[#F1F3F6] pt-3 text-[12.5px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Biến Secret</dt>
                  <dd className="font-mono text-xs text-ink">{i.secretRef ?? 'Chưa cấu hình'}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Quyền (Scopes)</dt>
                  <dd className="truncate text-xs text-ink">{i.scopes.length ? i.scopes.join(', ') : '—'}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Đồng bộ gần nhất</dt>
                  <dd className="text-xs text-muted">{relativeTime(i.lastSyncAt)}</dd>
                </div>
              </dl>
            </div>

            <IntegrationCardActions integration={i} role={currentUser.role} />
          </div>
        ))}
      </div>

      <p className="mt-5 rounded-xl border border-dashed border-border bg-card px-5 py-4 text-[13px] text-muted">
        Cột <code className="font-mono">secretRef</code> chỉ lưu <i>tên</i> biến môi trường hoặc vault key, không lưu token thật.
        Server đọc từ <code className="font-mono">process.env[secretRef]</code> trong runtime giúp bảo vệ tuyệt đối an toàn cơ sở dữ liệu.
      </p>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-ink">Webhook Endpoints</h2>
            <p className="mt-0.5 text-xs text-muted">
              Hệ thống tự động phát sự kiện tới các URL này kèm bản ghi lịch sử trong bảng <code className="font-mono">webhook_deliveries</code>.
            </p>
          </div>
        </div>

        {webhooks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted">
            Chưa có Webhook Endpoint nào được cấu hình.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {webhooks.map((w) => (
              <div
                key={w.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-xs"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Webhook size={18} className="flex-none text-muted" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <code className="truncate font-mono text-[13px] font-medium text-ink">{w.url}</code>
                      <span className="flex items-center gap-1 text-xs text-muted">
                        {w.active ? <CheckCircle2 size={13} className="text-success" /> : null}
                        {w.active ? 'Đang bật' : 'Đã tắt'}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {w.events.map((e) => (
                        <span
                          key={e}
                          className="rounded bg-[#F3F5F8] px-2 py-0.5 font-mono text-[11px] text-[#4b515c]"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <WebhookItemActions webhook={w} role={currentUser.role} />
              </div>
            ))}
          </div>
        )}

        <details className="mt-5 rounded-xl border border-border bg-card p-5">
          <summary className="cursor-pointer text-sm font-semibold text-ink">
            Danh mục các sự kiện hệ thống hỗ trợ phát ({WEBHOOK_EVENTS.length})
          </summary>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {WEBHOOK_EVENTS.map((e) => (
              <code key={e} className="rounded bg-[#F3F5F8] px-2.5 py-1 font-mono text-[11.5px] text-[#4b515c]">
                {e}
              </code>
            ))}
          </div>
        </details>
      </section>
    </>
  );
}
