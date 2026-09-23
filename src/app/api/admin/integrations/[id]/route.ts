import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIntegration } from '@/server/repositories';
import { guard, recordAudit } from '@/app/api/_lib';

export const runtime = 'nodejs';

/** GET /api/admin/integrations/[id] */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const { response } = await guard('integration', 'read');
  if (response) return response;

  const integration = await getIntegration(params.id);
  if (!integration) {
    return NextResponse.json({ error: 'Không tìm thấy kết nối.' }, { status: 404 });
  }

  return NextResponse.json(integration);
}

/** PATCH /api/admin/integrations/[id] — Cập nhật cấu hình kết nối */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { user, response } = await guard('integration', 'update');
  if (response) return response;

  try {
    const existing = await prisma.integration.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Không tìm thấy kết nối.' }, { status: 404 });
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.secretRef !== undefined) {
      const secretRef = String(body.secretRef || '').trim();
      if (secretRef && !/^[A-Z0-9_]+$|^vault:\/\/[\w/-]+$/.test(secretRef)) {
        return NextResponse.json(
          { error: 'secretRef chỉ nhận tên biến môi trường (ví dụ SLACK_BOT_TOKEN) hoặc vault key.' },
          { status: 422 },
        );
      }
      updateData.secretRef = secretRef || null;
    }
    if (body.scopes !== undefined && Array.isArray(body.scopes)) {
      updateData.scopes = body.scopes;
    }

    const updated = await prisma.integration.update({
      where: { id: existing.id },
      data: updateData,
    });

    await recordAudit({
      userId: user?.id,
      action: 'UPDATE',
      entityType: 'Integration',
      entityId: updated.id,
      summary: `Cập nhật cấu hình kết nối ${updated.name}`,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('[Update Integration Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ khi cập nhật kết nối.' }, { status: 500 });
  }
}

/** DELETE /api/admin/integrations/[id] — Xoá kết nối (chỉ OWNER) */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const { user, response } = await guard('integration', 'delete');
  if (response) return response;

  try {
    const existing = await prisma.integration.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Không tìm thấy kết nối.' }, { status: 404 });
    }

    await prisma.integration.delete({
      where: { id: existing.id },
    });

    await recordAudit({
      userId: user?.id,
      action: 'DELETE',
      entityType: 'Integration',
      entityId: existing.id,
      summary: `Xoá kết nối ${existing.provider}: ${existing.name}`,
    });

    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    console.error('[Delete Integration Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ khi xoá kết nối.' }, { status: 500 });
  }
}
