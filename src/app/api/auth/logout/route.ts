import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { SESSION_COOKIE_NAME } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const token = cookies().get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      await prisma.session.deleteMany({
        where: { token },
      });
    }

    const response = NextResponse.json({
      success: true,
      redirectTo: '/admin/login',
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('[Logout API Error]:', error);
    return NextResponse.json({ error: 'Lỗi khi đăng xuất.' }, { status: 500 });
  }
}
