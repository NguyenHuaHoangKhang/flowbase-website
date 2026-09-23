import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { listInvoices } from '@/server/repositories';
import { computeInvoiceTotals, invoiceCreateSchema } from '@/lib/validators';
import { emitEvent, guard, parseBody, recordAudit, searchParams } from '@/app/api/_lib';

export const runtime = 'nodejs';

/** GET /api/admin/invoices?q=&status=&page= */
export async function GET(request: Request) {
  const { response } = await guard('invoice', 'read');
  if (response) return response;

  const params = searchParams(request);
  const result = await listInvoices({
    q: params.q,
    status: params.status,
    page: params.page ? Number(params.page) : 1,
  });
  return NextResponse.json(result);
}

/** POST /api/admin/invoices — Tạo hoá đơn mới */
export async function POST(request: Request) {
  const { user, response } = await guard('invoice', 'create');
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, invoiceCreateSchema);
  if (invalid) return invalid;

  try {
    let finalCode = data.code ? data.code.trim() : '';

    if (!finalCode) {
      const year = new Date().getFullYear();
      const prefix = `INV-${year}-`;
      const latest = await prisma.invoice.findFirst({
        where: { code: { startsWith: prefix } },
        orderBy: { code: 'desc' },
        select: { code: true },
      });

      let nextSeq = 1;
      if (latest?.code) {
        const parts = latest.code.split('-');
        const lastNum = parseInt(parts[2], 10);
        if (!isNaN(lastNum)) {
          nextSeq = lastNum + 1;
        }
      }
      finalCode = `${prefix}${String(nextSeq).padStart(3, '0')}`;
    }

    const totals = computeInvoiceTotals({
      items: data.items,
      discount: data.discount,
      taxRate: data.taxRate,
    });

    const invoice = await prisma.invoice.create({
      data: {
        code: finalCode,
        clientId: data.clientId,
        projectId: data.projectId || null,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        currency: data.currency,
        exchangeRate: data.currency === 'VND' ? 1 : data.exchangeRate,
        subtotal: totals.subtotal,
        discount: data.discount,
        taxRate: data.taxRate,
        taxAmount: totals.taxAmount,
        total: totals.total,
        amountPaid: 0,
        status: 'DRAFT',
        note: data.note?.trim() || null,
        items: {
          create: data.items.map((item, idx) => ({
            description: item.description.trim(),
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: Math.round(item.quantity * item.unitPrice * 100) / 100,
            milestoneId: item.milestoneId || null,
            sortOrder: idx + 1,
          })),
        },
      },
      include: {
        client: { select: { name: true } },
        project: { select: { code: true } },
        items: true,
      },
    });

    await recordAudit({
      userId: user?.id,
      action: 'CREATE',
      entityType: 'Invoice',
      entityId: invoice.id,
      summary: `Tạo hoá đơn ${invoice.code} — Tổng ${totals.total.toLocaleString()} ${invoice.currency}`,
    });

    await emitEvent('invoice.created', invoice);

    return NextResponse.json(invoice, { status: 201 });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json(
        { error: 'Mã hoá đơn này đã tồn tại trên hệ thống.', field: 'code' },
        { status: 409 },
      );
    }
    console.error('[Create Invoice Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ khi tạo hoá đơn.' }, { status: 500 });
  }
}
