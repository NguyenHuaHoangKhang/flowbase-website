import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getProject } from '@/server/repositories';
import { projectUpdateSchema } from '@/lib/validators';
import { emitEvent, guard, parseBody, recordAudit } from '@/app/api/_lib';

export const runtime = 'nodejs';

/** GET /api/admin/projects/[id] */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const { response } = await guard('project', 'read');
  if (response) return response;

  const project = await getProject(params.id);
  if (!project) {
    return NextResponse.json({ error: 'Không tìm thấy dự án.' }, { status: 404 });
  }

  return NextResponse.json(project);
}

/** PATCH /api/admin/projects/[id] — cập nhật trạng thái, tiến độ, ưu tiên */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { user, response } = await guard('project', 'update');
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, projectUpdateSchema);
  if (invalid) return invalid;

  try {
    const existing = await prisma.project.findFirst({
      where: {
        id: params.id,
        deletedAt: null,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Không tìm thấy dự án.' }, { status: 404 });
    }

    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.progress !== undefined) updateData.progress = data.progress;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.summary !== undefined) updateData.summary = data.summary ? data.summary.trim() : null;
    if (data.clientId !== undefined) updateData.clientId = data.clientId || null;
    if (data.ownerId !== undefined) updateData.ownerId = data.ownerId || null;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;

    const updated = await prisma.project.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        client: { select: { name: true } },
        owner: { select: { name: true } },
      },
    });

    if (data.status && data.status !== existing.status) {
      await prisma.activity.create({
        data: {
          type: 'STATUS_CHANGE',
          projectId: updated.id,
          userId: user?.id,
          subject: 'Thay đổi trạng thái',
          body: `Chuyển trạng thái từ ${existing.status} sang ${data.status}`,
          meta: { from: existing.status, to: data.status },
        },
      });

      await recordAudit({
        userId: user?.id,
        action: 'UPDATE',
        entityType: 'Project',
        entityId: updated.id,
        summary: `Chuyển trạng thái dự án ${updated.code}: ${existing.status} → ${data.status}`,
      });
    } else {
      await recordAudit({
        userId: user?.id,
        action: 'UPDATE',
        entityType: 'Project',
        entityId: updated.id,
        summary: `Cập nhật dự án ${updated.code}`,
      });
    }

    await emitEvent('project.updated', updated);

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('[Update Project Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ khi cập nhật dự án.' }, { status: 500 });
  }
}
