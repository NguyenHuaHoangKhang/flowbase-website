import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { guard, parseBody, searchParams } from '@/app/api/_lib';
import { z } from 'zod';

export const runtime = 'nodejs';

const schema = z.object({
  type: z.enum(['CHANNEL', 'CATEGORY']),
  value: z.string().min(1, 'Vui lòng nhập giá trị'),
});

export async function GET(request: Request) {
  const { response } = await guard('category', 'read');
  if (response) return response;

  const params = searchParams(request);
  const type = params.type;

  const items = await prisma.systemCategory.findMany({
    where: {
      deletedAt: null,
      ...(type ? { type } : {}),
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const { response } = await guard('category', 'create');
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, schema);
  if (invalid) return invalid;

  try {
    const item = await prisma.systemCategory.create({
      data: {
        type: data.type,
        value: data.value,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Danh mục này đã tồn tại' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
