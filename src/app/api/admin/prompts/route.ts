import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { guard, parseBody, recordAudit, searchParams } from '@/app/api/_lib';
import { z } from 'zod';

export const runtime = 'nodejs';

const promptSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên prompt'),
  description: z.string().optional(),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().optional(),
  variables: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: Request) {
  const { response } = await guard('prompt', 'read');
  if (response) return response;

  const params = searchParams(request);
  const q = params.q?.toLowerCase() || '';
  const page = params.page ? Number(params.page) : 1;
  const take = 20;
  const skip = (page - 1) * take;

  const where = {
    deletedAt: null,
    ...(q ? { name: { contains: q, mode: 'insensitive' as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.prompt.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.prompt.count({ where }),
  ]);

  return NextResponse.json({
    items,
    metadata: {
      total,
      page,
      pages: Math.ceil(total / take),
      hasMore: skip + take < total,
    },
  });
}

export async function POST(request: Request) {
  const { user, response } = await guard('prompt', 'create');
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, promptSchema);
  if (invalid) return invalid;

  try {
    const prompt = await prisma.prompt.create({
      data: {
        name: data.name,
        description: data.description || null,
        systemPrompt: data.systemPrompt || null,
        userPrompt: data.userPrompt || null,
        variables: data.variables || [],
        tags: data.tags || [],
      },
    });

    await recordAudit({
      userId: user?.id,
      action: 'CREATE',
      entityType: 'Prompt',
      entityId: prompt.id,
      summary: `Tạo AI Prompt ${prompt.name}`,
    });

    return NextResponse.json(prompt, { status: 201 });
  } catch (err: any) {
    console.error('[Create Prompt Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ khi tạo prompt.' }, { status: 500 });
  }
}
