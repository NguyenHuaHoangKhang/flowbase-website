import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { listExpenses } from '@/server/repositories';
import { expenseSchema } from '@/lib/validators';
import { emitEvent, guard, parseBody, recordAudit, searchParams } from '@/app/api/_lib';

export const runtime = 'nodejs';

/** GET /api/admin/expenses?q=&category=&page= */
export async function GET(request: Request) {
  const { response } = await guard('expense', 'read');
  if (response) return response;

  const params = searchParams(request);
  const result = await listExpenses({
    q: params.q,
    category: params.category,
    page: params.page ? Number(params.page) : 1,
  });
  return NextResponse.json(result);
}

/** POST /api/admin/expenses — Ghi nhận khoản chi */
export async function POST(request: Request) {
  const { user, response } = await guard('expense', 'create');
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, expenseSchema);
  if (invalid) return invalid;

  try {
    const expense = await prisma.expense.create({
      data: {
        vendor: data.vendor.trim(),
        category: data.category,
        description: data.description?.trim() || null,
        amount: data.amount,
        currency: data.currency,
        spentAt: new Date(data.spentAt),
        billable: data.billable ?? false,
        recurrence: data.recurrence || null,
        projectId: data.projectId || null,
      },
      include: {
        project: { select: { code: true } },
      },
    });

    await recordAudit({
      userId: user?.id,
      action: 'CREATE',
      entityType: 'Expense',
      entityId: expense.id,
      summary: `Ghi chi phí ${data.vendor} — ${Number(data.amount).toLocaleString()} ${data.currency}`,
    });

    await emitEvent('expense.created', expense);

    return NextResponse.json(expense, { status: 201 });
  } catch (err: any) {
    console.error('[Create Expense Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ khi ghi chi phí.' }, { status: 500 });
  }
}
