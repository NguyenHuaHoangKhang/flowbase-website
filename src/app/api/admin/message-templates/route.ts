import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { guard, parseBody, searchParams } from '@/app/api/_lib';
import { z } from 'zod';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  category: z.string().min(1, 'Vui lòng chọn lĩnh vực'),
  channel: z.string().min(1, 'Vui lòng chọn kênh'),
  content: z.string().min(1, 'Nội dung mẫu tin nhắn không được để trống'),
});

export async function GET(request: Request) {
  const { response } = await guard('messageTemplate', 'read');
  if (response) return response;

  const params = searchParams(request);
  const q = params.q?.toLowerCase();

  const items = await prisma.messageTemplate.findMany({
    where: {
      deletedAt: null,
      ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const { response } = await guard('messageTemplate', 'create');
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, schema);
  if (invalid) return invalid;

  try {
    const item = await prisma.messageTemplate.create({
      data: {
        name: data.name,
        category: data.category,
        channel: data.channel,
        content: data.content,
      },
    });

    // Tự động tạo SystemCategory nếu chưa có
    await Promise.all([
      prisma.systemCategory.upsert({
        where: { type_value: { type: 'CATEGORY', value: data.category } },
        update: { deletedAt: null },
        create: { type: 'CATEGORY', value: data.category },
      }),
      prisma.systemCategory.upsert({
        where: { type_value: { type: 'CHANNEL', value: data.channel } },
        update: { deletedAt: null },
        create: { type: 'CHANNEL', value: data.channel },
      }),
    ]);

    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
