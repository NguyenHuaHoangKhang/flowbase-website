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
        <div className="min-w-0 flex-1 flex flex-col">
          <header className="sticky top-0 z-[60] flex h-14 items-center justify-between gap-4 border-b border-border bg-bg/85 px-5 backdrop-blur-[10px] lg:px-7">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-muted">/admin</span>
            </div>

            <AdminHeaderActions user={user} />
          </header>

          <main className="px-5 py-6 pb-24 lg:px-7 lg:pb-10">{children}</main>

          <footer className="mt-auto border-t border-border bg-bg/50 px-5 py-4 text-center text-[12px] text-muted lg:px-7 flex items-center justify-center gap-4">
            <span>Dev Links:</span>
            <a href="https://vercel.com/nguyenhuahoangkhang/flowbase-website/deployments" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors hover:underline">Vercel</a>
            <span className="opacity-30">|</span>
            <a href="https://console.neon.tech/app/projects/aged-band-30713826/branches/br-billowing-tree-azb9l0f8?database=neondb" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors hover:underline">Neon DB</a>
            <span className="opacity-30">|</span>
            <a href="https://github.com/NguyenHuaHoangKhang/flowbase-website" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors hover:underline">GitHub</a>
          </footer>
        </div>
      </ToastProvider>
    </div>
  );
}
