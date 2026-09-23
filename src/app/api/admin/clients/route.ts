import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { listClients } from '@/server/repositories';
import { clientCreateSchema } from '@/lib/validators';
import { emitEvent, guard, parseBody, recordAudit, searchParams } from '@/app/api/_lib';

export const runtime = 'nodejs';

/** GET /api/admin/clients?q=&page= */
export async function GET(request: Request) {
  const { response } = await guard('client', 'read');
  if (response) return response;

  const params = searchParams(request);
  const result = await listClients({
    q: params.q,
    page: params.page ? Number(params.page) : 1,
  });
  return NextResponse.json(result);
}

/** POST /api/admin/clients — tạo khách hàng mới */
export async function POST(request: Request) {
  const { user, response } = await guard('client', 'create');
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, clientCreateSchema);
  if (invalid) return invalid;

  try {
    const client = await prisma.client.create({
      data: {
        name: data.name,
        legalName: data.legalName || null,
        taxCode: data.taxCode ? data.taxCode.trim() : null,
        email: data.email ? data.email.trim().toLowerCase() : null,
        phone: data.phone || null,
        address: data.address || null,
        website: data.website || null,
        status: data.status,
        note: data.note || null,
      },
    });

    await recordAudit({
      userId: user?.id,
      action: 'CREATE',
      entityType: 'Client',
      entityId: client.id,
      summary: `Tạo khách hàng ${client.name}`,
    });

    await emitEvent('client.created', client);

    return NextResponse.json(client, { status: 201 });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json(
        { error: 'Mã số thuế này đã tồn tại trên hệ thống.', field: 'taxCode' },
        { status: 409 },
      );
    }
    console.error('[Create Client Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ khi tạo khách hàng.' }, { status: 500 });
  }
}
