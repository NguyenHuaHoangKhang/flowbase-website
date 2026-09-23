import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { guard, parseBody } from '@/app/api/_lib';
import { z } from 'zod';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().min(1, 'Tên không được để trống').optional(),
  category: z.string().min(1, 'Vui lòng chọn lĩnh vực').optional(),
  channel: z.string().min(1, 'Vui lòng chọn kênh').optional(),
  content: z.string().min(1, 'Nội dung mẫu tin nhắn không được để trống').optional(),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { response } = await guard('messageTemplate', 'update');
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, schema);
  if (invalid) return invalid;

  try {
    const item = await prisma.messageTemplate.update({
      where: { id: params.id },
      data,
    });

    // Tự động tạo SystemCategory nếu chưa có và có gửi lên category/channel mới
    const tasks = [];
    if (data.category) {
      tasks.push(
        prisma.systemCategory.upsert({
          where: { type_value: { type: 'CATEGORY', value: data.category } },
          update: { deletedAt: null },
          create: { type: 'CATEGORY', value: data.category },
        })
      );
    }
    if (data.channel) {
      tasks.push(
        prisma.systemCategory.upsert({
          where: { type_value: { type: 'CHANNEL', value: data.channel } },
          update: { deletedAt: null },
          create: { type: 'CHANNEL', value: data.channel },
        })
      );
    }
    await Promise.all(tasks);

    return NextResponse.json(item);
  } catch (err: any) {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { response } = await guard('messageTemplate', 'delete');
  if (response) return response;

  await prisma.messageTemplate.update({
    where: { id: params.id },
    data: { deletedAt: new Date() },
  });

  return new NextResponse(null, { status: 204 });
}
