import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { guard, parseBody } from '@/app/api/_lib';
import { z } from 'zod';

export const runtime = 'nodejs';

const schema = z.object({
  type: z.enum(['CHANNEL', 'CATEGORY']).optional(),
  value: z.string().min(1, 'Vui lòng nhập giá trị').optional(),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { response } = await guard('category', 'update');
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, schema);
  if (invalid) return invalid;

  try {
    const item = await prisma.systemCategory.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(item);
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Danh mục này đã tồn tại' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { response } = await guard('category', 'delete');
  if (response) return response;

  await prisma.systemCategory.update({
    where: { id: params.id },
    data: { deletedAt: new Date() },
  });

  return new NextResponse(null, { status: 204 });
}
