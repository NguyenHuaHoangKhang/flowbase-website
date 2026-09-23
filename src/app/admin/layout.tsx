import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeaderActions from '@/components/admin/AdminHeaderActions';
import { ToastProvider } from '@/components/admin/ui';

export const metadata: Metadata = {
  title: 'FLOWBASE Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '';

  // Nếu đang ở trang đăng nhập /admin/login, render trực tiếp không bọc layout và không redirect
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const user = await getCurrentUser();

  // Nếu không có phiên hợp lệ và không phải trang login -> chuyển hướng về trang login
  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <ToastProvider>
        <Sidebar user={user} />
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-[60] flex h-14 items-center justify-between gap-4 border-b border-border bg-bg/85 px-5 backdrop-blur-[10px] lg:px-7">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-muted">/admin</span>
            </div>

            <AdminHeaderActions user={user} />
          </header>

          <main className="px-5 py-6 pb-24 lg:px-7 lg:pb-10">{children}</main>
        </div>
      </ToastProvider>
    </div>
  );
}
