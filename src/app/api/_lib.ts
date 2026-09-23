import { NextResponse } from 'next/server';
import { ZodError, type ZodSchema } from 'zod';
import { prisma } from '@/lib/prisma';
import { PermissionError, assertCan, type Action, type Resource } from '@/lib/rbac';
import { getCurrentUser } from '@/lib/session';
import type { AuditAction } from '@/lib/types';

/**
 * Tiện ích dùng chung cho mọi API route admin:
 * xác thực → phân quyền → validate → trả lỗi đúng chuẩn.
 *
 * Mọi handler nên đi qua `guard()` để không có route nào quên kiểm tra quyền.
 */

export async function guard(resource: Resource, action: Action) {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  try {
    assertCan(user.role, resource, action);
  } catch (err) {
    if (err instanceof PermissionError) {
      return { user, response: NextResponse.json({ error: err.message }, { status: 403 }) };
    }
    throw err;
  }
  return { user, response: null };
}

export async function parseBody<T>(request: Request, schema: ZodSchema<T>) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { data: null, response: NextResponse.json({ error: 'Body không phải JSON hợp lệ.' }, { status: 400 }) };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    return { data: null, response: NextResponse.json(zodError(result.error), { status: 422 }) };
  }
  return { data: result.data, response: null };
}

export function zodError(error: ZodError) {
  const fields: Record<string, string[]> = {};
  const messages: string[] = [];
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    (fields[key] ??= []).push(issue.message);
    messages.push(issue.message);
  }
  const uniqueMessages = Array.from(new Set(messages));
  return { error: `Dữ liệu không hợp lệ: ${uniqueMessages.join('; ')}`, fields };
}

export function searchParams(request: Request) {
  return Object.fromEntries(new URL(request.url).searchParams);
}

/**
 * Ghi nhật ký hệ thống (Audit Log) vào bảng audit_logs trong PostgreSQL.
 * Bảng append-only, ghi nhận mọi thao tác CREATE, UPDATE, DELETE, GRANT_ACCESS...
 */
export async function recordAudit(entry: {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  summary?: string;
  diff?: unknown;
  ip?: string;
}) {
  try {
    const validActions: AuditAction[] = [
      'CREATE',
      'UPDATE',
      'DELETE',
      'LOGIN',
      'LOGOUT',
      'EXPORT',
      'GRANT_ACCESS',
      'REVOKE_ACCESS',
    ];

    const action = validActions.includes(entry.action as AuditAction)
      ? (entry.action as AuditAction)
      : 'UPDATE';

    return await prisma.auditLog.create({
      data: {
        userId: entry.userId || null,
        action,
        entityType: entry.entityType,
        entityId: entry.entityId || null,
        summary: entry.summary || null,
        diff: entry.diff ? (entry.diff as any) : undefined,
        ip: entry.ip || null,
      },
    });
  } catch (err) {
    console.error('[recordAudit Error]:', err);
    return null;
  }
}

/**
 * Bắn webhook cho các endpoint đang đăng ký sự kiện này.
 * Tạo bản ghi webhook_deliveries trong PostgreSQL và gửi HTTP POST kèm timeout.
 */
export async function emitEvent(event: string, payload: unknown) {
  try {
    console.info('[event]', event, payload);

    // 1. Tìm tất cả endpoint đang hoạt động
    const endpoints = await prisma.webhookEndpoint.findMany({
      where: {
        active: true,
      },
    });

    const matchingEndpoints = endpoints.filter(
      (ep) => ep.events.includes(event) || ep.events.includes('*') || ep.events.length === 0,
    );

    if (matchingEndpoints.length === 0) {
      return [];
    }

    // 2. Tạo bản ghi WebhookDelivery cho từng endpoint và thực hiện gửi
    const deliveries = await Promise.all(
      matchingEndpoints.map(async (ep) => {
        const delivery = await prisma.webhookDelivery.create({
          data: {
            endpointId: ep.id,
            event,
            payload: payload as any,
            status: 'PENDING',
            attempts: 0,
          },
        });

        // Bắn HTTP POST kèm timeout 5 giây
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const res = await fetch(ep.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Flowbase-Event': event,
              'X-Flowbase-Delivery': delivery.id,
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          const resBody = await res.text().catch(() => '');
          const success = res.ok;

          await prisma.webhookDelivery.update({
            where: { id: delivery.id },
            data: {
              status: success ? 'SUCCESS' : 'FAILED',
              attempts: 1,
              responseCode: res.status,
              responseBody: resBody.slice(0, 1000),
              deliveredAt: success ? new Date() : null,
              nextRetryAt: success ? null : new Date(Date.now() + 60 * 1000),
            },
          });
        } catch (fetchErr: any) {
          await prisma.webhookDelivery.update({
            where: { id: delivery.id },
            data: {
              status: 'FAILED',
              attempts: 1,
              responseBody: fetchErr?.message || 'Gửi HTTP thất bại / Timeout',
              nextRetryAt: new Date(Date.now() + 60 * 1000),
            },
          });
        }

        return delivery;
      }),
    );

    return deliveries;
  } catch (err) {
    console.error('[emitEvent Error]:', err);
    return [];
  }
}
