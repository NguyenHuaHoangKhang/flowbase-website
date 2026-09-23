import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { guard, recordAudit } from '@/app/api/_lib';

export const runtime = 'nodejs';

/** PATCH /api/admin/webhooks/[id] — Bật/tắt active hoặc cập nhật endpoint */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { user, response } = await guard('integration', 'update');
  if (response) return response;

  try {
    const existing = await prisma.webhookEndpoint.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Không tìm thấy webhook endpoint.' }, { status: 404 });
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.active !== undefined) updateData.active = Boolean(body.active);
    if (body.url !== undefined) updateData.url = String(body.url).trim();
    if (body.description !== undefined) updateData.description = body.description ? String(body.description).trim() : null;
    if (body.events !== undefined && Array.isArray(body.events)) updateData.events = body.events;

    const updated = await prisma.webhookEndpoint.update({
      where: { id: existing.id },
      data: updateData,
    });

    await recordAudit({
      userId: user?.id,
      action: 'UPDATE',
      entityType: 'WebhookEndpoint',
      entityId: updated.id,
      summary: `Cập nhật Webhook Endpoint ${updated.url} (active: ${updated.active})`,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('[Update Webhook Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ khi cập nhật webhook endpoint.' }, { status: 500 });
  }
}

/** DELETE /api/admin/webhooks/[id] — Xoá endpoint */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const { user, response } = await guard('integration', 'delete');
  if (response) return response;

  try {
    const existing = await prisma.webhookEndpoint.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Không tìm thấy webhook endpoint.' }, { status: 404 });
    }

    await prisma.webhookEndpoint.delete({
      where: { id: existing.id },
    });

    await recordAudit({
      userId: user?.id,
      action: 'DELETE',
      entityType: 'WebhookEndpoint',
      entityId: existing.id,
      summary: `Xoá Webhook Endpoint: ${existing.url}`,
    });

    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    console.error('[Delete Webhook Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ khi xoá webhook endpoint.' }, { status: 500 });
  }
}
