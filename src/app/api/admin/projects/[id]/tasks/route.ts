import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitEvent, guard, parseBody, recordAudit } from '@/app/api/_lib';
import { taskCreateSchema } from '@/lib/validators';

export const runtime = 'nodejs';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  // EDITOR should be able to create tasks
  const { user, response } = await guard('project', 'read'); // 'read' ensures they have access to the project
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, taskCreateSchema);
  if (invalid) return invalid;

  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { id: true, code: true, title: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Không tìm thấy dự án.' }, { status: 404 });
    }

    const task = await prisma.task.create({
      data: {
        projectId: project.id,
        title: data.title,
        detail: data.detail || null,
        assigneeId: data.assigneeId,
        estimateHours: data.estimateHours,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        subtasks: data.subtasks ? (data.subtasks as any) : [],
        attachments: data.attachments ? (data.attachments as any) : [],
      },
    });

    await recordAudit({
      userId: user?.id,
      action: 'CREATE',
      entityType: 'Task',
      entityId: task.id,
      summary: `Tạo công việc "${task.title}" cho dự án ${project.code}`,
    });

    await emitEvent('project.task_created', task);

    return NextResponse.json(task, { status: 201 });
  } catch (err: any) {
    console.error('[Create Task Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ khi tạo công việc.' }, { status: 500 });
  }
}
