import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { listProjects } from '@/server/repositories';
import { projectCreateSchema } from '@/lib/validators';
import type { ProjectStatus } from '@/lib/types';
import { emitEvent, guard, parseBody, recordAudit, searchParams } from '@/app/api/_lib';

export const runtime = 'nodejs';

/** GET /api/admin/projects?q=&status=&page= */
export async function GET(request: Request) {
  const { response } = await guard('project', 'read');
  if (response) return response;

  const params = searchParams(request);
  const result = await listProjects({
    q: params.q,
    status: params.status as ProjectStatus | undefined,
    page: params.page ? Number(params.page) : 1,
  });
  return NextResponse.json(result);
}

/** POST /api/admin/projects — Tạo dự án mới */
export async function POST(request: Request) {
  const { user, response } = await guard('project', 'create');
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, projectCreateSchema);
  if (invalid) return invalid;

  try {
    let finalCode = data.code ? data.code.trim() : '';

    if (!finalCode) {
      const year = new Date().getFullYear();
      const prefix = `FB-${year}-`;
      const latest = await prisma.project.findFirst({
        where: { code: { startsWith: prefix } },
        orderBy: { code: 'desc' },
        select: { code: true },
      });

      let nextSeq = 1;
      if (latest?.code) {
        const parts = latest.code.split('-');
        const lastNum = parseInt(parts[2], 10);
        if (!isNaN(lastNum)) {
          nextSeq = lastNum + 1;
        }
      }
      finalCode = `${prefix}${String(nextSeq).padStart(3, '0')}`;
    }

    const project = await prisma.project.create({
      data: {
        code: finalCode,
        title: data.title.trim(),
        summary: data.summary?.trim() || null,
        clientId: data.clientId || null,
        leadId: data.leadId || null,
        ownerId: data.ownerId || user?.id || null,
        status: data.status,
        priority: data.priority,
        billingType: data.billingType,
        budgetAmount: data.budgetAmount,
        currency: data.currency,
        hourlyRate: data.hourlyRate ?? null,
        progress: data.progress ?? 0,
        startDate: data.startDate ? new Date(data.startDate) : null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
      include: {
        client: { select: { name: true } },
        owner: { select: { name: true } },
      },
    });

    await prisma.activity.create({
      data: {
        type: 'NOTE',
        projectId: project.id,
        userId: user?.id,
        subject: 'Dự án được tạo mới',
        body: `Dự án "${project.title}" (${project.code}) được tạo bởi ${user?.name ?? 'Người dùng'}`,
      },
    });

    await recordAudit({
      userId: user?.id,
      action: 'CREATE',
      entityType: 'Project',
      entityId: project.id,
      summary: `Tạo dự án ${project.code} — ${project.title}`,
    });

    await emitEvent('project.created', project);

    return NextResponse.json(project, { status: 201 });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json(
        { error: 'Mã dự án này đã tồn tại trên hệ thống.', field: 'code' },
        { status: 409 },
      );
    }
    console.error('[Create Project Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ khi tạo dự án.' }, { status: 500 });
  }
}
