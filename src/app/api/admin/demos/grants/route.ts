import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { listGrants } from '@/server/repositories';
import { demoGrantSchema } from '@/lib/validators';
import { emitEvent, guard, parseBody, recordAudit, searchParams } from '@/app/api/_lib';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { response } = await guard('demo', 'read');
  if (response) return response;

  const { demoId } = searchParams(request);
  return NextResponse.json(await listGrants(demoId));
}

/**
 * POST /api/admin/demos/grants
 * Cấp quyền xem demo riêng cho một email, trả về link kèm token bảo mật.
 */
export async function POST(request: Request) {
  const { user, response } = await guard('demo', 'create');
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, demoGrantSchema);
  if (invalid) return invalid;

  try {
    // 1. Kiểm tra demo tồn tại và chưa bị xoá mềm
    const demo = await prisma.demo.findFirst({
      where: {
        id: data.demoId,
        deletedAt: null,
      },
    });

    if (!demo) {
      return NextResponse.json({ error: 'Không tìm thấy demo.' }, { status: 404 });
    }

    const email = data.email.trim().toLowerCase();
    const token = `gr_${randomBytes(6).toString('hex')}`;
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

    // 2. Kiểm tra grant đã tồn tại theo unique (demoId, email)
    const existingGrant = await prisma.demoAccessGrant.findUnique({
      where: {
        demoId_email: {
          demoId: data.demoId,
          email,
        },
      },
    });

    let grantRecord;

    if (existingGrant) {
      // Nếu grant đang còn sống và chưa bị thu hồi
      if (!existingGrant.revokedAt && (!existingGrant.expiresAt || existingGrant.expiresAt > new Date())) {
        return NextResponse.json(
          {
            error: `Email "${email}" đã được cấp quyền truy cập demo này. Vui lòng thu hồi hoặc chia sẻ lại link cũ.`,
          },
          { status: 409 },
        );
      }

      // Nếu grant cũ đã hết hạn hoặc đã bị thu hồi -> Tái kích hoạt và cấp token mới
      grantRecord = await prisma.demoAccessGrant.update({
        where: { id: existingGrant.id },
        data: {
          token,
          leadId: data.leadId || null,
          note: data.note?.trim() || null,
          maxViews: data.maxViews ?? null,
          viewCount: 0,
          expiresAt,
          revokedAt: null,
        },
        include: {
          demo: { select: { title: true, slug: true } },
        },
      });
    } else {
      // Tạo grant mới
      grantRecord = await prisma.demoAccessGrant.create({
        data: {
          demoId: data.demoId,
          leadId: data.leadId || null,
          email,
          token,
          note: data.note?.trim() || null,
          maxViews: data.maxViews ?? null,
          expiresAt,
        },
        include: {
          demo: { select: { title: true, slug: true } },
        },
      });
    }

    await recordAudit({
      userId: user?.id,
      action: 'GRANT_ACCESS',
      entityType: 'Demo',
      entityId: demo.id,
      summary: `Cấp quyền xem demo ${demo.title} cho ${email}`,
    });

    const shareUrl = `/demo/${grantRecord.demo.slug}?t=${grantRecord.token}`;

    await emitEvent('demo.access_granted', {
      ...grantRecord,
      shareUrl,
    });

    return NextResponse.json(
      {
        id: grantRecord.id,
        demoId: grantRecord.demoId,
        demoTitle: grantRecord.demo.title,
        demoSlug: grantRecord.demo.slug,
        leadId: grantRecord.leadId,
        email: grantRecord.email,
        token: grantRecord.token,
        maxViews: grantRecord.maxViews,
        viewCount: grantRecord.viewCount,
        expiresAt: grantRecord.expiresAt ? grantRecord.expiresAt.toISOString() : null,
        revokedAt: grantRecord.revokedAt ? grantRecord.revokedAt.toISOString() : null,
        lastViewAt: grantRecord.lastViewAt ? grantRecord.lastViewAt.toISOString() : null,
        createdAt: grantRecord.createdAt.toISOString(),
        shareUrl,
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error('[Create Grant Error]:', err);
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi cấp quyền xem demo.' },
      { status: 500 },
    );
  }
}
