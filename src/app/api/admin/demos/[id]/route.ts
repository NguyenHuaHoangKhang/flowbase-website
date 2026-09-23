import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getDemo } from '@/server/repositories';
import { demoUpdateSchema } from '@/lib/validators';
import { emitEvent, guard, parseBody, recordAudit } from '@/app/api/_lib';

export const runtime = 'nodejs';

/** GET /api/admin/demos/[id] — Xem chi tiết demo */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const { response } = await guard('demo', 'read');
  if (response) return response;

  const demo = await getDemo(params.id);
  if (!demo) {
    return NextResponse.json({ error: 'Không tìm thấy demo.' }, { status: 404 });
  }

  return NextResponse.json(demo);
}

/** PATCH /api/admin/demos/[id] — Cập nhật demo */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { user, response } = await guard('demo', 'update');
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, demoUpdateSchema);
  if (invalid) return invalid;

  try {
    const existing = await prisma.demo.findFirst({
      where: {
        id: params.id,
        deletedAt: null,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Không tìm thấy demo.' }, { status: 404 });
    }

    // 1. Nếu thay đổi slug, kiểm tra trùng lặp
    if (data.slug && data.slug.trim().toLowerCase() !== existing.slug) {
      const slugConflict = await prisma.demo.findFirst({
        where: {
          slug: data.slug.trim().toLowerCase(),
          deletedAt: null,
          id: { not: existing.id },
        },
      });
      if (slugConflict) {
        return NextResponse.json(
          { error: `Slug "${data.slug}" đã được sử dụng. Vui lòng chọn slug khác.` },
          { status: 409 },
        );
      }
    }

    const updateData: any = {};
    if (data.slug !== undefined) updateData.slug = data.slug.trim().toLowerCase();
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.category !== undefined) updateData.category = data.category.trim();
    if (data.summary !== undefined) updateData.summary = data.summary.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.label !== undefined) updateData.label = data.label;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.visibility !== undefined) updateData.visibility = data.visibility;
    if (data.liveUrl !== undefined) updateData.liveUrl = data.liveUrl?.trim() || null;
    if (data.repoUrl !== undefined) updateData.repoUrl = data.repoUrl?.trim() || null;
    if (data.techStack !== undefined) updateData.techStack = data.techStack;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    // 2. Xử lý mật khẩu nếu đổi sang hoặc đang ở PASSWORD
    const targetVisibility = data.visibility ?? existing.visibility;
    if (targetVisibility === 'PASSWORD') {
      if (data.accessPassword) {
        updateData.accessPasswordHash = await bcrypt.hash(data.accessPassword, 10);
      } else if (!existing.accessPasswordHash) {
        return NextResponse.json(
          { error: 'Vui lòng cung cấp mật khẩu khi đặt chế độ PASSWORD.' },
          { status: 422 },
        );
      }
    }

    // 3. Xử lý ngày xuất bản khi chuyển sang PUBLISHED
    if (data.status === 'PUBLISHED' && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updated = await prisma.demo.update({
      where: { id: existing.id },
      data: updateData,
    });

    await recordAudit({
      userId: user?.id,
      action: 'UPDATE',
      entityType: 'Demo',
      entityId: updated.id,
      summary: `Cập nhật demo ${updated.title} (/${updated.slug})`,
    });

    if (data.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      await emitEvent('demo.published', updated);
    }

    return NextResponse.json({
      id: updated.id,
      slug: updated.slug,
      title: updated.title,
      category: updated.category,
      summary: updated.summary,
      label: updated.label,
      status: updated.status,
      visibility: updated.visibility,
      liveUrl: updated.liveUrl,
      repoUrl: updated.repoUrl,
      techStack: updated.techStack,
      sortOrder: updated.sortOrder,
      viewCount: updated.viewCount,
      publishedAt: updated.publishedAt?.toISOString() || null,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err: any) {
    console.error('[Update Demo Error]:', err);
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi cập nhật demo.' },
      { status: 500 },
    );
  }
}

/** DELETE /api/admin/demos/[id] — Xoá mềm demo */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const { user, response } = await guard('demo', 'delete');
  if (response) return response;

  try {
    const existing = await prisma.demo.findFirst({
      where: {
        id: params.id,
        deletedAt: null,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Không tìm thấy demo.' }, { status: 404 });
    }

    // Xoá mềm (soft delete)
    await prisma.demo.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });

    await recordAudit({
      userId: user?.id,
      action: 'DELETE',
      entityType: 'Demo',
      entityId: existing.id,
      summary: `Xoá mềm demo ${existing.title} (/${existing.slug})`,
    });

    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    console.error('[Delete Demo Error]:', err);
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi xoá demo.' },
      { status: 500 },
    );
  }
}
