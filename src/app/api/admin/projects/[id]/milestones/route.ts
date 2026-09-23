import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitEvent, guard, parseBody, recordAudit } from '@/app/api/_lib';
import { milestoneCreateSchema } from '@/lib/validators';

export const runtime = 'nodejs';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { user, response } = await guard('project', 'update');
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, milestoneCreateSchema);
  if (invalid) return invalid;

  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { id: true, code: true, title: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Không tìm thấy dự án.' }, { status: 404 });
    }

    const milestone = await prisma.milestone.create({
      data: {
        projectId: project.id,
        title: data.title,
        detail: data.detail,
        amount: data.amount,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });

    await recordAudit({
      userId: user?.id,
      action: 'CREATE',
      entityType: 'Milestone',
      entityId: milestone.id,
      summary: `Tạo mốc thanh toán "${milestone.title}" cho dự án ${project.code}`,
    });

    await emitEvent('project.milestone_created', milestone);

    return NextResponse.json(milestone, { status: 201 });
  } catch (err: any) {
    console.error('[Create Milestone Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ khi tạo mốc thanh toán.' }, { status: 500 });
  }
}
