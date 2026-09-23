import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paymentRecordSchema } from '@/lib/validators';
import { emitEvent, guard, parseBody, recordAudit } from '@/app/api/_lib';

export const runtime = 'nodejs';

/** POST /api/admin/invoices/[id]/payments — Ghi nhận khoản thanh toán */
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { user, response } = await guard('invoice', 'update');
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, paymentRecordSchema);
  if (invalid) return invalid;

  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        deletedAt: null,
        OR: [{ id: params.id }, { code: params.id }],
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Không tìm thấy hoá đơn.' }, { status: 404 });
    }

    if (invoice.status === 'VOID') {
      return NextResponse.json(
        { error: 'Không thể ghi nhận thanh toán cho hoá đơn đã huỷ (VOID).' },
        { status: 400 },
      );
    }

    // Ghi nhận thanh toán vào DB
    // PostgreSQL Trigger `sync_invoice_payment_state` sẽ tự động tính toán
    // lại amountPaid, paidAt và status của Invoice.
    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: data.amount,
        currency: data.currency,
        method: data.method,
        paidAt: new Date(data.paidAt),
        reference: data.reference?.trim() || null,
        note: data.note?.trim() || null,
      },
    });

    // Lấy trạng thái hoá đơn sau khi trigger PostgreSQL đã thực thi
    const updatedInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
    });

    await recordAudit({
      userId: user?.id,
      action: 'UPDATE',
      entityType: 'Invoice',
      entityId: invoice.id,
      summary: `Thu ${Number(payment.amount).toLocaleString()} ${payment.currency} cho hoá đơn ${invoice.code}`,
    });

    await emitEvent('invoice.payment_recorded', { payment, invoice: updatedInvoice });

    return NextResponse.json({ payment, invoice: updatedInvoice }, { status: 201 });
  } catch (err: any) {
    console.error('[Record Payment Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ khi ghi nhận thanh toán.' }, { status: 500 });
  }
}
