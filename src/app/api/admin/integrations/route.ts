import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { listIntegrations } from '@/server/repositories';
import { integrationSchema } from '@/lib/validators';
import { guard, parseBody, recordAudit } from '@/app/api/_lib';

export const runtime = 'nodejs';

/** GET /api/admin/integrations — Lấy danh sách kết nối */
export async function GET() {
  const { response } = await guard('integration', 'read');
  if (response) return response;

  const data = await listIntegrations();
  return NextResponse.json(data);
}

/** POST /api/admin/integrations — Tạo cấu hình kết nối mới */
export async function POST(request: Request) {
  const { user, response } = await guard('integration', 'create');
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, integrationSchema);
  if (invalid) return invalid;

  try {
    const existing = await prisma.integration.findUnique({
      where: {
        provider_name: {
          provider: data.provider,
          name: data.name.trim(),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Kết nối "${data.name}" cho nhà cung cấp ${data.provider} đã tồn tại.` },
        { status: 409 },
      );
    }

    const integration = await prisma.integration.create({
      data: {
        provider: data.provider,
        name: data.name.trim(),
        secretRef: data.secretRef?.trim() || null,
        scopes: data.scopes || [],
        status: 'DISCONNECTED',
      },
    });

    await recordAudit({
      userId: user?.id,
      action: 'CREATE',
      entityType: 'Integration',
      entityId: integration.id,
      summary: `Tạo kết nối ${integration.provider}: ${integration.name}`,
    });

    return NextResponse.json(integration, { status: 201 });
  } catch (err: any) {
    console.error('[Create Integration Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ khi tạo kết nối.' }, { status: 500 });
  }
}
