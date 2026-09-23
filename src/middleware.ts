import { NextResponse, type NextRequest } from 'next/server';

/**
 * Lớp bảo vệ Middleware:
 * - Bảo vệ toàn bộ route /admin/* và /api/admin/*
 * - Luôn cho phép truy cập trang /admin/login để tránh vòng lặp chuyển hướng
 * - Chống Open Redirect và gắn x-pathname header cho Server Components
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('fb_session')?.value;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // 1. Cho phép truy cập trang đăng nhập (không redirect tự lặp)
  if (pathname === '/admin/login') {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // 2. Chặn nếu chưa có phiên đăng nhập
  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized: Phiên đăng nhập không tồn tại hoặc đã hết hạn.' },
        { status: 401 },
      );
    }

    const loginUrl = new URL('/admin/login', request.url);
    if (pathname !== '/admin') {
      loginUrl.searchParams.set('next', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
