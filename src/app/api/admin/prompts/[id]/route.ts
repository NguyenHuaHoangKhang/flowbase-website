import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { guard, parseBody, recordAudit } from '@/app/api/_lib';
import { z } from 'zod';

export const runtime = 'nodejs';

const promptUpdateSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên prompt'),
  description: z.string().optional(),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().optional(),
  variables: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { response } = await guard('prompt', 'read');
  if (response) return response;

  const prompt = await prisma.prompt.findUnique({
    where: { id: params.id, deletedAt: null },
  });

  if (!prompt) {
    return NextResponse.json({ error: 'Không tìm thấy prompt' }, { status: 404 });
  }

  return NextResponse.json(prompt);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { user, response } = await guard('prompt', 'update');
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, promptUpdateSchema);
  if (invalid) return invalid;

  try {
    const prompt = await prisma.prompt.update({
      where: { id: params.id, deletedAt: null },
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
      action: 'UPDATE',
      entityType: 'Prompt',
      entityId: prompt.id,
      summary: `Cập nhật AI Prompt ${prompt.name}`,
    });

    return NextResponse.json(prompt);
  } catch (err: any) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Không tìm thấy prompt' }, { status: 404 });
    }
    console.error('[Update Prompt Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { user, response } = await guard('prompt', 'delete');
  if (response) return response;

  try {
    const prompt = await prisma.prompt.update({
      where: { id: params.id, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    await recordAudit({
      userId: user?.id,
      action: 'DELETE',
      entityType: 'Prompt',
      entityId: prompt.id,
      summary: `Xoá AI Prompt ${prompt.name}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Không tìm thấy prompt' }, { status: 404 });
    }
    console.error('[Delete Prompt Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
