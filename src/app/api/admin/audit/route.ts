import { NextResponse } from 'next/server';
import { listAuditLogs } from '@/server/repositories';
import { guard, searchParams } from '@/app/api/_lib';

export const runtime = 'nodejs';

/** GET /api/admin/audit — Tra cứu nhật ký hệ thống */
export async function GET(request: Request) {
  const { response } = await guard('audit', 'read');
  if (response) return response;

  const params = searchParams(request);
  const result = await listAuditLogs({
    q: params.q,
    entityType: params.entityType,
    action: params.action,
    page: params.page ? Number(params.page) : 1,
  });

  return NextResponse.json(result);
}
