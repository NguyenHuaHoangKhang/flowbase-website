import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { listDemos } from '@/server/repositories';
import { demoSchema } from '@/lib/validators';
import { emitEvent, guard, parseBody, recordAudit, searchParams } from '@/app/api/_lib';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { response } = await guard('demo', 'read');
  if (response) return response;

  const params = searchParams(request);
  const result = await listDemos({
    q: params.q,
    status: params.status,
    label: params.label,
    page: params.page ? Number(params.page) : 1,
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const { user, response } = await guard('demo', 'create');
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, demoSchema);
  if (invalid) return invalid;

  try {
    // 1. Kiểm tra tính duy nhất của slug trên các bản ghi còn sống
    const existing = await prisma.demo.findFirst({
      where: {
        slug: data.slug.trim().toLowerCase(),
        deletedAt: null,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Slug "${data.slug}" đã được sử dụng. Vui lòng chọn slug khác.` },
        { status: 409 },
      );
    }

    // 2. Hash accessPassword bằng bcrypt nếu visibility = PASSWORD
    let accessPasswordHash: string | null = null;
    if (data.visibility === 'PASSWORD') {
      if (!data.accessPassword) {
        return NextResponse.json(
          { error: 'Vui lòng cung cấp mật khẩu khi đặt chế độ PASSWORD.' },
          { status: 422 },
        );
      }
      accessPasswordHash = await bcrypt.hash(data.accessPassword, 10);
    }

    // 3. Đảm bảo publishedAt nếu status = PUBLISHED (khớp DB chk_demo_published_requires_date)
    const publishedAt = data.status === 'PUBLISHED' ? new Date() : null;

    // 4. Tạo demo mới trong cơ sở dữ liệu PostgreSQL
    const demo = await prisma.demo.create({
      data: {
        slug: data.slug.trim().toLowerCase(),
        title: data.title.trim(),
        category: data.category.trim(),
        summary: data.summary.trim(),
        description: data.description?.trim() || null,
        label: data.label,
        status: data.status,
        visibility: data.visibility,
        accessPasswordHash,
        liveUrl: data.liveUrl?.trim() || null,
        repoUrl: data.repoUrl?.trim() || null,
        techStack: data.techStack || [],
        sortOrder: data.sortOrder || 0,
        publishedAt,
      },
    });

    // 5. Ghi nhận audit log
    await recordAudit({
      userId: user?.id,
      action: 'CREATE',
      entityType: 'Demo',
      entityId: demo.id,
      summary: `Tạo demo ${demo.title} (/${demo.slug})`,
    });

    // 6. Phát sự kiện nếu xuất bản
    if (data.status === 'PUBLISHED') {
      await emitEvent('demo.published', demo);
    }

    return NextResponse.json(
      {
        id: demo.id,
        slug: demo.slug,
        title: demo.title,
        category: demo.category,
        summary: demo.summary,
        label: demo.label,
        status: demo.status,
        visibility: demo.visibility,
        liveUrl: demo.liveUrl,
        repoUrl: demo.repoUrl,
        techStack: demo.techStack,
        sortOrder: demo.sortOrder,
        viewCount: demo.viewCount,
        publishedAt: demo.publishedAt?.toISOString() || null,
        updatedAt: demo.updatedAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error('[Create Demo Error]:', err);
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi tạo demo.' },
      { status: 500 },
    );
  }
}
