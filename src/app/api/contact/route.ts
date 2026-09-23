import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { leadCreateSchema } from '@/lib/validators';
import { emitEvent, recordAudit, zodError } from '@/app/api/_lib';

export const runtime = 'nodejs';

/**
 * Form Contact công khai trên website.
 *
 * Luồng hoàn chỉnh:
 *   1. validate bằng leadCreateSchema (khớp CHECK trong constraints.sql)
 *   2. prisma.lead.create — unique index uniq_lead_email_per_day chặn spam
 *      gửi lặp trong cùng ngày, bắt lỗi P2002 và trả 200 êm để không lộ cho bot
 *   3. recordAudit() ghi nhận vào bảng audit_logs
 *   4. emitEvent('lead.created') → dispatch webhook tới các tích hợp
 *   5. forward sang CONTACT_WEBHOOK_URL nếu có cấu hình
 */
export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body không phải JSON hợp lệ.' }, { status: 400 });
  }

  const parsed = leadCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(zodError(parsed.error), { status: 422 });
  }

  const lead = parsed.data;
  const ip = request.headers.get('x-forwarded-for') || undefined;

  let createdLead = null;
  try {
    createdLead = await prisma.lead.create({
      data: {
        name: lead.name.trim(),
        email: lead.email.toLowerCase().trim(),
        phone: lead.phone?.trim() || null,
        company: lead.company?.trim() || null,
        message: lead.message.trim(),
        source: lead.source,
        utmSource: lead.utmSource?.trim() || null,
        utmMedium: lead.utmMedium?.trim() || null,
        utmCampaign: lead.utmCampaign?.trim() || null,
        status: 'NEW',
        score: 10,
      },
    });

    await recordAudit({
      action: 'CREATE',
      entityType: 'Lead',
      entityId: createdLead.id,
      summary: `Lead từ website: ${lead.name}${lead.company ? ` (${lead.company})` : ''}`,
      ip,
    });

    await emitEvent('lead.created', createdLead);
  } catch (err: any) {
    if (err.code === 'P2002') {
      // Vi phạm uniq_lead_email_per_day: cùng 1 email gửi nhiều lần trong ngày
      // Trả 200 êm để tránh lộ thông tin cho spam bot
      return NextResponse.json({ delivered: true, note: 'duplicate-accepted' });
    }
    console.error('[POST /api/contact] DB Error:', err);
    return NextResponse.json({ error: 'Không thể lưu thông tin liên hệ.' }, { status: 500 });
  }

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (!webhook) {
    return NextResponse.json({ delivered: true, leadId: createdLead.id });
  }

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...createdLead, source: 'flowbase.site' }),
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    return NextResponse.json({ delivered: true, leadId: createdLead.id });
  } catch {
    return NextResponse.json({ delivered: true, leadId: createdLead.id, transportError: true });
  }
}
