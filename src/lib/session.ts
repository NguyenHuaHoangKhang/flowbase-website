import { cookies } from 'next/headers';
import { prisma } from './prisma';
import type { User, UserRole, UserStatus } from './types';

export const SESSION_COOKIE_NAME = 'fb_session';

/**
 * Lấy thông tin người dùng hiện tại từ cookie phiên và Database PostgreSQL.
 *
 * Mọi trang admin và API route đều gọi getCurrentUser() rồi kiểm tra
 * quyền qua src/lib/rbac.ts — không tự so sánh role ở nơi khác.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    // Tra cứu phiên trong PostgreSQL
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) return null;

    // Kiểm tra hết hạn phiên
    if (session.expiresAt < new Date()) {
      return null;
    }

    const u = session.user;
    if (u.status !== 'ACTIVE' || u.deletedAt) {
      return null;
    }

    return {
      id: u.id,
      email: u.email,
      name: u.name,
      avatarUrl: u.avatarUrl,
      role: u.role as UserRole,
      status: u.status as UserStatus,
      lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
      createdAt: u.createdAt.toISOString(),
    };
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE' || err?.message?.includes('Dynamic server usage')) {
      throw err;
    }
    console.error('[getCurrentUser Error]:', err);
    return null;
  }
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  return user;
}
