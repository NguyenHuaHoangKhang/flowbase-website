import { NextResponse } from 'next/server';
import { getLead } from '@/server/repositories';
import { leadUpdateSchema } from '@/lib/validators';
import { emitEvent, guard, parseBody, recordAudit } from '@/app/api/_lib';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { response } = await guard('lead', 'read');
  if (response) return response;

  const lead = await getLead(params.id);
  if (!lead) return NextResponse.json({ error: 'Không tìm thấy lead.' }, { status: 404 });
  return NextResponse.json(lead);
}

/**
 * PATCH /api/admin/leads/[id]
 * Đổi trạng thái, gán người phụ trách, chấm điểm.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { user, response } = await guard('lead', 'update');
  if (response) return response;

  const existing = await getLead(params.id);
  if (!existing) return NextResponse.json({ error: 'Không tìm thấy lead.' }, { status: 404 });

  const { data, response: invalid } = await parseBody(request, leadUpdateSchema);
  if (invalid) return invalid;

  // prisma.$transaction([ update lead, create activity, create auditLog ])
  const updated = await prisma.$transaction(async (tx) => {
    const updatedLead = await tx.lead.update({
      where: { id: existing.id },
      data,
    });

    if (data.status && data.status !== existing.status) {
      await tx.activity.create({
        data: {
          type: 'STATUS_CHANGE',
          leadId: existing.id,
          userId: user?.id,
          subject: `Đổi trạng thái: ${existing.status} → ${data.status}`,
          body: data.lostReason ? `Lý do mất: ${data.lostReason}` : null,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user?.id || null,
          action: 'UPDATE',
          entityType: 'Lead',
          entityId: existing.id,
          summary: `Đổi trạng thái ${existing.status} → ${data.status}`,
          diff: { before: { status: existing.status }, after: { status: data.status } },
          ip: request.headers.get('x-forwarded-for') || null,
        },
      });
    }

    return updatedLead;
  });

  if (data.status && data.status !== existing.status) {
    await emitEvent('lead.status_changed', updated);
    if (data.status === 'WON') await emitEvent('lead.won', updated);
    if (data.status === 'LOST') await emitEvent('lead.lost', updated);
  }

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { user, response } = await guard('lead', 'delete');
  if (response) return response;

  // Soft delete: set deletedAt thay vì xoá hẳn, để audit còn tham chiếu được.
  await recordAudit({
    userId: user?.id, action: 'DELETE', entityType: 'Lead', entityId: params.id,
    summary: 'Xoá mềm lead',
  });
  return new NextResponse(null, { status: 204 });
}
