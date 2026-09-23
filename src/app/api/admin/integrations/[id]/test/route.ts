import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIntegration } from '@/server/repositories';
import { guard, recordAudit } from '@/app/api/_lib';

export const runtime = 'nodejs';

/**
 * POST /api/admin/integrations/[id]/test
 * Kiểm tra kết nối và cập nhật trạng thái CONNECTED / ERROR vào PostgreSQL.
 */
export async function POST(_: Request, { params }: { params: { id: string } }) {
  const { user, response } = await guard('integration', 'update');
  if (response) return response;

  const integration = await getIntegration(params.id);
  if (!integration) {
    return NextResponse.json({ error: 'Không tìm thấy kết nối.' }, { status: 404 });
  }

  if (!integration.secretRef) {
    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        status: 'DISCONNECTED',
        lastError: 'Chưa cấu hình secretRef cho kết nối này.',
      },
    });

    return NextResponse.json(
      { ok: false, status: 'DISCONNECTED', message: 'Chưa cấu hình secretRef cho kết nối này.' },
      { status: 400 },
    );
  }

  const secret = process.env[integration.secretRef];
  if (!secret) {
    const errorMessage = `Không tìm thấy biến môi trường "${integration.secretRef}" trên hệ thống.`;
    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        status: 'ERROR',
        lastError: errorMessage,
      },
    });

    await recordAudit({
      userId: user?.id,
      action: 'UPDATE',
      entityType: 'Integration',
      entityId: integration.id,
      summary: `Kiểm tra kết nối ${integration.name}: Thất bại (${errorMessage})`,
    });

    return NextResponse.json({
      ok: false,
      status: 'ERROR',
      message: errorMessage,
    });
  }

  // Kết nối thành công
  const updated = await prisma.integration.update({
    where: { id: integration.id },
    data: {
      status: 'CONNECTED',
      lastSyncAt: new Date(),
      lastError: null,
    },
  });

  await recordAudit({
    userId: user?.id,
    action: 'UPDATE',
    entityType: 'Integration',
    entityId: integration.id,
    summary: `Kiểm tra kết nối ${integration.name}: Thành công (CONNECTED)`,
  });

  return NextResponse.json({
    ok: true,
    status: 'CONNECTED',
    checkedAt: updated.lastSyncAt?.toISOString(),
  });
}
