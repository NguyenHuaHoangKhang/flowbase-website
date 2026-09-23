import type { UserRole } from './types';

/**
 * Ma trận phân quyền. Mọi API route và trang admin đều kiểm tra qua đây
 * thay vì so sánh role rải rác trong code.
 */

export const RESOURCES = [
  'dashboard', 'demo', 'lead', 'client', 'project',
  'invoice', 'expense', 'integration', 'user', 'audit', 'prompt',
  'category', 'messageTemplate'
] as const;

export type Resource = (typeof RESOURCES)[number];
export type Action = 'read' | 'create' | 'update' | 'delete';

const ALL: Action[] = ['read', 'create', 'update', 'delete'];
const RW: Action[] = ['read', 'create', 'update'];
const R: Action[] = ['read'];

const matrix: Record<UserRole, Partial<Record<Resource, Action[]>>> = {
  OWNER: Object.fromEntries(RESOURCES.map((r) => [r, ALL])),
  ADMIN: {
    dashboard: R, demo: ALL, lead: ALL, client: ALL, project: ALL,
    invoice: RW, expense: RW, integration: RW, audit: R, prompt: ALL,
    category: ALL, messageTemplate: ALL
    // không quản lý user
  },
  EDITOR: {
    dashboard: R, demo: RW, lead: RW, client: R, project: RW,
    // không thấy tài chính, integration, audit
  },
  VIEWER: {
    dashboard: R, demo: R, lead: R, client: R, project: R,
  },
};

export function can(role: UserRole, resource: Resource, action: Action): boolean {
  return matrix[role]?.[resource]?.includes(action) ?? false;
}

export function canAccess(role: UserRole, resource: Resource): boolean {
  return can(role, resource, 'read');
}

/** Dùng trong API route: ném lỗi 403 nếu không đủ quyền. */
export function assertCan(role: UserRole, resource: Resource, action: Action) {
  if (!can(role, resource, action)) {
    throw new PermissionError(`${role} không có quyền ${action} trên ${resource}.`);
  }
}

export class PermissionError extends Error {
  status = 403;
}
