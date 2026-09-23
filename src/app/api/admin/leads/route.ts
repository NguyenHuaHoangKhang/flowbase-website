import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { listLeads } from '@/server/repositories';
import { leadCreateSchema } from '@/lib/validators';
import type { LeadStatus } from '@/lib/types';
import { emitEvent, guard, parseBody, recordAudit, searchParams } from '@/app/api/_lib';

export const runtime = 'nodejs';

/** GET /api/admin/leads?q=&status=&page= */
export async function GET(request: Request) {
  const { response } = await guard('lead', 'read');
  if (response) return response;

  const params = searchParams(request);
  const result = await listLeads({
    q: params.q,
    status: params.status as LeadStatus | undefined,
    page: params.page ? Number(params.page) : 1,
  });
  return NextResponse.json(result);
}

/** POST /api/admin/leads — tạo lead thủ công từ admin */
export async function POST(request: Request) {
  const { user, response } = await guard('lead', 'create');
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, leadCreateSchema);
  if (invalid) return invalid;

  try {
    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email.trim().toLowerCase(),
        phone: data.phone || null,
        company: data.company || null,
        message: data.message,
        source: data.source,
        status: 'NEW',
        ownerId: user?.id || null,
        utmSource: data.utmSource || null,
        utmMedium: data.utmMedium || null,
        utmCampaign: data.utmCampaign || null,
      },
    });

    await recordAudit({
      userId: user?.id,
      action: 'CREATE',
      entityType: 'Lead',
      entityId: lead.id,
      summary: `Tạo lead ${lead.name}`,
    });
    await emitEvent('lead.created', lead);

    return NextResponse.json(lead, { status: 201 });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email này đã gửi yêu cầu trong ngày hôm nay. Vui lòng kiểm tra lại.' },
        { status: 409 },
      );
    }
    console.error('[Create Lead Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ khi tạo lead.' }, { status: 500 });
  }
}
