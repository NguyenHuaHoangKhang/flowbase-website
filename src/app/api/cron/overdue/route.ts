import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recordAudit } from '@/app/api/_lib';

export const runtime = 'nodejs';

/**
 * GET/POST /api/cron/overdue
 * Tự động quét và cập nhật các hoá đơn quá hạn sang trạng thái OVERDUE
 * Được gọi bởi cron job định kỳ (Vercel Cron hoặc external scheduler).
 */
export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}

async function handleCron(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized cron request.' }, { status: 401 });
  }

  try {
    const result = await prisma.$queryRawUnsafe<{ mark_overdue_invoices: number }[]>(
      'SELECT mark_overdue_invoices();',
    );
    const affected = result[0]?.mark_overdue_invoices ?? 0;

    if (affected > 0) {
      await recordAudit({
        action: 'UPDATE',
        entityType: 'Invoice',
        summary: `Cron mark_overdue_invoices: Chuyển ${affected} hoá đơn sang OVERDUE`,
      });
    }

    return NextResponse.json({ success: true, overdueInvoicesMarked: affected });
  } catch (err: any) {
    console.error('[CRON /api/cron/overdue] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi thực thi cron mark_overdue_invoices' },
      { status: 500 },
    );
  }
}
