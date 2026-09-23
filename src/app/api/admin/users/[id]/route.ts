import { NextResponse } from 'next/server';
import { getUser, updateUser, deleteUser } from '@/server/repositories';
import { userUpdateSchema } from '@/lib/validators';
import { guard, parseBody, recordAudit } from '@/app/api/_lib';

export const runtime = 'nodejs';

/** GET /api/admin/users/[id] — Xem chi tiết người dùng */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const { response } = await guard('user', 'read');
  if (response) return response;

  const user = await getUser(params.id);
  if (!user) {
    return NextResponse.json({ error: 'Không tìm thấy người dùng.' }, { status: 404 });
  }

  return NextResponse.json(user);
}

/** PATCH /api/admin/users/[id] — Cập nhật họ tên, vai trò hoặc trạng thái */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { user: currentUser, response } = await guard('user', 'update');
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, userUpdateSchema);
  if (invalid) return invalid;

  try {
    const existing = await getUser(params.id);
    if (!existing) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng.' }, { status: 404 });
    }

    const updated = await updateUser(params.id, data);

    await recordAudit({
      userId: currentUser?.id,
      action: 'UPDATE',
      entityType: 'User',
      entityId: updated.id,
      summary: `Cập nhật người dùng: ${updated.name} (${updated.email})`,
      diff: {
        before: { name: existing.name, role: existing.role, status: existing.status },
        after: { name: updated.name, role: updated.role, status: updated.status },
      },
      ip: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('[PATCH /api/admin/users/[id]] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Không thể cập nhật người dùng.' },
      { status: 400 },
    );
  }
}

/** DELETE /api/admin/users/[id] — Xoá mềm người dùng (Chỉ OWNER) */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { user: currentUser, response } = await guard('user', 'delete');
  if (response) return response;

  if (currentUser?.id === params.id) {
    return NextResponse.json(
      { error: 'Không thể tự xoá tài khoản của chính mình.' },
      { status: 400 },
    );
  }

  try {
    const existing = await getUser(params.id);
    if (!existing) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng.' }, { status: 404 });
    }

    await deleteUser(params.id);

    await recordAudit({
      userId: currentUser?.id,
      action: 'DELETE',
      entityType: 'User',
      entityId: existing.id,
      summary: `Xoá người dùng: ${existing.name} (${existing.email})`,
      ip: request.headers.get('x-forwarded-for') || undefined,
    });

    return new Response(null, { status: 204 });
  } catch (err: any) {
    console.error('[DELETE /api/admin/users/[id]] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Không thể xoá người dùng.' },
      { status: 400 },
    );
  }
}
