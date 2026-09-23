import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { guard, recordAudit } from '@/app/api/_lib';

export const runtime = 'nodejs';

/** POST /api/admin/demos/grants/[id]/revoke — Thu hồi quyền xem demo */
export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const { user, response } = await guard('demo', 'update');
  if (response) return response;

  try {
    const grant = await prisma.demoAccessGrant.findUnique({
      where: { id: params.id },
      include: {
        demo: { select: { title: true, slug: true } },
      },
    });

    if (!grant) {
      return NextResponse.json({ error: 'Không tìm thấy quyền truy cập.' }, { status: 404 });
    }

    if (grant.revokedAt) {
      return NextResponse.json({ error: 'Quyền truy cập này đã bị thu hồi trước đó.' }, { status: 400 });
    }

    const updated = await prisma.demoAccessGrant.update({
      where: { id: grant.id },
      data: { revokedAt: new Date() },
    });

    await recordAudit({
      userId: user?.id,
      action: 'REVOKE_ACCESS',
      entityType: 'Demo',
      entityId: grant.demoId,
      summary: `Thu hồi quyền xem demo ${grant.demo.title} của ${grant.email}`,
    });

    return NextResponse.json({
      ok: true,
      id: updated.id,
      revokedAt: updated.revokedAt?.toISOString(),
    });
  } catch (err: any) {
    console.error('[Revoke Grant Error]:', err);
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi thu hồi quyền truy cập.' },
      { status: 500 },
    );
  }
}
