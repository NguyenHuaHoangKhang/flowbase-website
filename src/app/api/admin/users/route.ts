import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { listUsers, createUser } from '@/server/repositories';
import { userCreateSchema } from '@/lib/validators';
import { guard, parseBody, recordAudit } from '@/app/api/_lib';

export const runtime = 'nodejs';

/** GET /api/admin/users — Lấy danh sách người dùng (Chỉ OWNER) */
export async function GET() {
  const { response } = await guard('user', 'read');
  if (response) return response;

  const data = await listUsers();
  return NextResponse.json(data);
}

/** POST /api/admin/users — Tạo / Mời thành viên mới (Chỉ OWNER) */
export async function POST(request: Request) {
  const { user: currentUser, response } = await guard('user', 'create');
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, userCreateSchema);
  if (invalid) return invalid;

  try {
    const existing = await prisma.user.findFirst({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Email "${data.email}" đã tồn tại trong hệ thống.` },
        { status: 409 },
      );
    }

    const newUser = await createUser({
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      password: data.password,
    });

    await recordAudit({
      userId: currentUser?.id,
      action: 'CREATE',
      entityType: 'User',
      entityId: newUser.id,
      summary: `Tạo người dùng mới: ${newUser.name} (${newUser.email}) vai trò ${newUser.role}`,
      ip: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/admin/users] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Không thể tạo người dùng.' },
      { status: 500 },
    );
  }
}
