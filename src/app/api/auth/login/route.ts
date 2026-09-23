import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { SESSION_COOKIE_NAME } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Body JSON không hợp lệ.' }, { status: 400 });
    }

    const { email, password, role, next } = body;

    let user: any = null;

    // 1. Nếu dùng Quick Switcher theo Role (tiện lợi cho môi trường kiểm thử/dev)
    if (role) {
      user = await prisma.user.findFirst({
        where: { role, status: 'ACTIVE', deletedAt: null },
      });
      if (!user) {
        return NextResponse.json(
          { error: `Không tìm thấy tài khoản với vai trò ${role}. Hãy chạy npm run db:seed.` },
          { status: 404 },
        );
      }
    } else {
      // 2. Đăng nhập thông thường qua Email & Password
      if (!email || typeof email !== 'string') {
        return NextResponse.json({ error: 'Vui lòng nhập email.' }, { status: 400 });
      }
      if (!password || typeof password !== 'string') {
        return NextResponse.json({ error: 'Vui lòng nhập mật khẩu.' }, { status: 400 });
      }

      user = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });

      if (!user || user.status !== 'ACTIVE' || user.deletedAt) {
        return NextResponse.json(
          { error: 'Email hoặc mật khẩu không chính xác.' },
          { status: 401 },
        );
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash ?? '');
      if (!isMatch) {
        return NextResponse.json(
          { error: 'Email hoặc mật khẩu không chính xác.' },
          { status: 401 },
        );
      }
    }

    // 3. Khởi tạo phiên trong PostgreSQL
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 86400 * 1000); // 7 ngày

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
        ip: request.headers.get('x-forwarded-for') || null,
        userAgent: request.headers.get('user-agent') || null,
      },
    });

    // Cập nhật mốc đăng nhập gần nhất
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 4. Validate đường dẫn chuyển hướng an toàn (Chống Open Redirect)
    let safeRedirect = '/admin';
    if (typeof next === 'string' && next.startsWith('/') && !next.startsWith('//')) {
      safeRedirect = next;
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      redirectTo: safeRedirect,
    });

    // 5. Ghi Set-Cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 7 * 86400,
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error: any) {
    console.error('[Login API Error]:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi máy chủ trong lúc đăng nhập.' }, { status: 500 });
  }
}
