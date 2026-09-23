import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { listWebhooks } from '@/server/repositories';
import { webhookEndpointSchema } from '@/lib/validators';
import { guard, parseBody, recordAudit } from '@/app/api/_lib';

export const runtime = 'nodejs';

/** GET /api/admin/webhooks — Lấy danh sách webhook endpoints */
export async function GET() {
  const { response } = await guard('integration', 'read');
  if (response) return response;

  const data = await listWebhooks();
  return NextResponse.json(data);
}

/** POST /api/admin/webhooks — Đăng ký webhook endpoint mới */
export async function POST(request: Request) {
  const { user, response } = await guard('integration', 'create');
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, webhookEndpointSchema);
  if (invalid) return invalid;

  try {
    const endpoint = await prisma.webhookEndpoint.create({
      data: {
        url: data.url.trim(),
        description: data.description?.trim() || null,
        events: data.events,
        active: data.active ?? true,
        integrationId: data.integrationId || null,
      },
    });

    await recordAudit({
      userId: user?.id,
      action: 'CREATE',
      entityType: 'WebhookEndpoint',
      entityId: endpoint.id,
      summary: `Tạo Webhook Endpoint: ${endpoint.url} (${endpoint.events.join(', ')})`,
    });

    return NextResponse.json(endpoint, { status: 201 });
  } catch (err: any) {
    console.error('[Create Webhook Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ khi tạo webhook endpoint.' }, { status: 500 });
  }
}
