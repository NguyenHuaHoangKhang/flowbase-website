import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitEvent, guard, parseBody, recordAudit } from '@/app/api/_lib';
import { taskUpdateSchema } from '@/lib/validators';

export const runtime = 'nodejs';

export async function PUT(request: Request, { params }: { params: { id: string; taskId: string } }) {
  const { user, response } = await guard('project', 'read'); 
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, taskUpdateSchema);
  if (invalid) return invalid;

  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { id: true, code: true, title: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Không tìm thấy dự án.' }, { status: 404 });
    }

    const existingTask = await prisma.task.findFirst({
      where: { id: params.taskId, projectId: project.id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Không tìm thấy công việc.' }, { status: 404 });
    }

    const task = await prisma.task.update({
      where: { id: existingTask.id },
      data: {
        title: data.title,
        detail: data.detail !== undefined ? data.detail : existingTask.detail,
        assigneeId: data.assigneeId,
        estimateHours: data.estimateHours,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: data.status,
        subtasks: data.subtasks ? (data.subtasks as any) : existingTask.subtasks,
        attachments: data.attachments ? (data.attachments as any) : existingTask.attachments,
        ...(data.status === 'DONE' && existingTask.status !== 'DONE' ? { doneAt: new Date() } : {}),
      },
    });

    await recordAudit({
      userId: user?.id,
      action: 'UPDATE',
      entityType: 'Task',
      entityId: task.id,
      summary: `Cập nhật công việc "${task.title}" của dự án ${project.code}`,
    });

    await emitEvent('project.task_updated', task);

    return NextResponse.json(task);
  } catch (err: any) {
    console.error('[Update Task Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ khi cập nhật công việc.' }, { status: 500 });
  }
}
