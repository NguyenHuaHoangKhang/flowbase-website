'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Inbox, MonitorPlay, Building2, FolderKanban,
  Receipt, Wallet, Plug, Users, ScrollText, Menu, X, LogOut, Database,
  MessageSquare, Tags
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { canAccess, type Resource } from '@/lib/rbac';
import type { User, UserRole } from '@/lib/types';

type Item = { href: string; label: string; icon: typeof Inbox; resource: Resource; external?: boolean };

const groups: { title: string; items: Item[] }[] = [
  {
    title: 'Tổng quan',
    items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard, resource: 'dashboard' }],
  },
  {
    title: 'Khách hàng',
    items: [
      { href: '/admin/leads', label: 'Liên hệ / Lead', icon: Inbox, resource: 'lead' },
      { href: '/admin/clients', label: 'Khách hàng', icon: Building2, resource: 'client' },
    ],
  },
  {
    title: 'AI Studio',
    items: [
      { href: '/admin/message-templates', label: 'Mẫu tin nhắn', icon: MessageSquare, resource: 'messageTemplate' },
      { href: '/admin/prompts', label: 'AI Prompts', icon: MonitorPlay, resource: 'prompt' },
    ],
  },
  {
    title: 'Công việc',
    items: [
      { href: '/admin/projects', label: 'Dự án', icon: FolderKanban, resource: 'project' },
      { href: '/admin/demos', label: 'Demo', icon: MonitorPlay, resource: 'demo' },
    ],
  },
  {
    title: 'Tài chính',
    items: [
      { href: '/admin/invoices', label: 'Hoá đơn', icon: Receipt, resource: 'invoice' },
      { href: '/admin/expenses', label: 'Chi phí', icon: Wallet, resource: 'expense' },
    ],
  },
  {
    title: 'Hệ thống',
    items: [
      { href: '/admin/categories', label: 'Danh mục', icon: Tags, resource: 'category' },
      { href: '/admin/integrations', label: 'Kết nối', icon: Plug, resource: 'integration' },
      { href: 'http://localhost:5555', label: 'Database', icon: Database, resource: 'integration', external: true },
      { href: '/admin/users', label: 'Người dùng', icon: Users, resource: 'user' },
      { href: '/admin/audit', label: 'Nhật ký', icon: ScrollText, resource: 'audit' },
    ],
  },
];

const roleBadges: Record<UserRole, { label: string; className: string }> = {
  OWNER: { label: 'OWNER', className: 'bg-primary/20 text-primary border-primary/30' },
  ADMIN: { label: 'ADMIN', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  EDITOR: { label: 'EDITOR', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  VIEWER: { label: 'VIEWER', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

export default function Sidebar({ role, user }: { role?: UserRole; user?: User | null }) {
  const effectiveRole = user?.role ?? role ?? 'VIEWER';
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  const nav = (
    <nav className="flex flex-col gap-6">
      {groups.map((group) => {
        const visible = group.items.filter((i) => canAccess(effectiveRole, i.resource));
        if (!visible.length) return null;
        return (
          <div key={group.title}>
            <span className="mb-2 block px-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[#5f6673]">
              {group.title}
            </span>
            {visible.map((item) => {
              const active =
                item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] transition-colors',
                    active
                      ? 'bg-white/[0.08] font-semibold text-white'
                      : 'text-[#A8AEBA] hover:bg-white/[0.04] hover:text-white',
                  )}
                  {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <item.icon size={17} strokeWidth={1.8} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );

  const userCard = user ? (
    <div className="mt-auto border-t border-dark-border pt-4">
      <div className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.03] p-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-primary/20 font-mono text-xs font-bold text-primary">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-white">
              {user.name}
            </span>
            <span className="flex items-center gap-1.5 text-[10.5px] text-[#8A909C]">
              <span
                className={cn(
                  'rounded border px-1 py-0.2 text-[9px] font-bold uppercase',
                  roleBadges[user.role]?.className,
                )}
              >
                {user.role}
              </span>
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          title="Đăng xuất"
          className="flex h-7 w-7 flex-none items-center justify-center rounded-lg text-[#8A909C] transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut size={15} />
        </button>
      </div>
      <Link
        href="/"
        className="mt-3 block px-3 text-[12px] text-[#5f6673] transition-colors hover:text-white"
      >
        ← Về website FLOWBASE
      </Link>
    </div>
  ) : (
    <Link
      href="/"
      className="mt-auto rounded-lg px-3 py-2 text-[13px] text-[#5f6673] transition-colors hover:text-white"
    >
      ← Về website
    </Link>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[248px] flex-none flex-col border-r border-dark-border bg-dark px-3 py-5 lg:flex">
        <Link href="/admin" className="mb-7 px-3 text-[16px] font-extrabold tracking-[-0.03em] text-white">
          FLOWBASE <span className="text-primary">/</span>
          <span className="ml-1.5 font-mono text-[10px] font-normal text-[#5f6673]">admin</span>
        </Link>
        <div className="flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">{nav}</div>
        {userCard}
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Mở menu admin"
        className="fixed bottom-5 right-5 z-[70] flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white shadow-lg lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Drawer Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 z-[75] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-[80] flex w-[280px] flex-col bg-dark px-3 py-5 transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-6 flex items-center justify-between px-3">
          <span className="text-[16px] font-extrabold text-white">
            FLOWBASE <span className="text-primary">/</span>
          </span>
          <button onClick={() => setOpen(false)} aria-label="Đóng" className="text-white">
            <X size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">{nav}</div>
        {userCard}
      </div>
    </>
  );
}
