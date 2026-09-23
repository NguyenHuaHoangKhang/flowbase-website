import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { guard, recordAudit } from '@/app/api/_lib';

export const runtime = 'nodejs';

/**
 * POST /api/admin/webhooks/[id]/test
 * Gửi một sự kiện ping thử nghiệm tới endpoint và ghi nhận vào webhook_deliveries.
 */
export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const { user, response } = await guard('integration', 'update');
  if (response) return response;

  try {
    const endpoint = await prisma.webhookEndpoint.findUnique({
      where: { id: params.id },
    });

    if (!endpoint) {
      return NextResponse.json({ error: 'Không tìm thấy webhook endpoint.' }, { status: 404 });
    }

    const pingPayload = {
      event: 'system.ping',
      timestamp: new Date().toISOString(),
      triggeredBy: user?.email || 'admin',
      message: 'FLOWBASE Webhook Test Delivery',
    };

    const delivery = await prisma.webhookDelivery.create({
      data: {
        endpointId: endpoint.id,
        event: 'system.ping',
        payload: pingPayload,
        status: 'PENDING',
        attempts: 1,
      },
    });

    let success = false;
    let statusCode: number | null = null;
    let responseBody = '';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Flowbase-Event': 'system.ping',
          'X-Flowbase-Delivery': delivery.id,
        },
        body: JSON.stringify(pingPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      statusCode = res.status;
      success = res.ok;
      responseBody = await res.text().catch(() => '');
    } catch (fetchErr: any) {
      responseBody = fetchErr?.message || 'Không thể kết nối tới URL webhook.';
    }

    const updatedDelivery = await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: success ? 'SUCCESS' : 'FAILED',
        responseCode: statusCode,
        responseBody: responseBody.slice(0, 1000),
        deliveredAt: success ? new Date() : null,
      },
    });

    await recordAudit({
      userId: user?.id,
      action: 'UPDATE',
      entityType: 'WebhookEndpoint',
      entityId: endpoint.id,
      summary: `Gửi test ping tới ${endpoint.url}: ${success ? 'Thành công' : 'Thất bại'} (${statusCode || 'Lỗi kết nối'})`,
    });

    return NextResponse.json({
      ok: success,
      status: updatedDelivery.status,
      responseCode: statusCode,
      responseBody,
      deliveryId: updatedDelivery.id,
    });
  } catch (err: any) {
    console.error('[Test Webhook Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ khi thử nghiệm gửi webhook.' }, { status: 500 });
  }
}
