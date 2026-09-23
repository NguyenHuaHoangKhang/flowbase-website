'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ChevronDown, UserCheck, Sparkles } from 'lucide-react';
import type { User, UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

const roleBadges: Record<UserRole, { label: string; className: string }> = {
  OWNER: { label: 'OWNER', className: 'bg-primary/10 text-primary border-primary/20' },
  ADMIN: { label: 'ADMIN', className: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
  EDITOR: { label: 'EDITOR', className: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
  VIEWER: { label: 'VIEWER', className: 'bg-gray-500/10 text-gray-700 border-gray-500/20' },
};

const ROLES: UserRole[] = ['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'];

export default function AdminHeaderActions({ user }: { user: User }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
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

  const handleSwitchRole = async (targetRole: UserRole) => {
    if (targetRole === user.role) {
      setDropdownOpen(false);
      return;
    }

    setSwitching(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });

      if (res.ok) {
        setDropdownOpen(false);
        router.refresh();
      }
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="relative flex items-center gap-3">
      {/* Dev Quick Role Switcher Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={cn(
            'flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold transition-all hover:border-[#c9cfd8]',
            dropdownOpen && 'border-primary ring-2 ring-primary/10',
          )}
        >
          <Sparkles size={12} className="text-amber-500" />
          <span className="hidden sm:inline text-muted font-normal">Đổi vai trò:</span>
          <span className={cn('rounded px-1.5 py-0.5 font-mono text-[10px] font-bold border', roleBadges[user.role]?.className)}>
            {user.role}
          </span>
          <ChevronDown size={12} className="text-muted" />
        </button>

        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 top-full z-20 mt-1.5 w-56 rounded-xl border border-border bg-card p-1.5 shadow-lg">
              <div className="px-2 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted">
                Chuyển nhanh vai trò (Dev):
              </div>
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  disabled={switching}
                  onClick={() => handleSwitchRole(r)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-ink transition-colors hover:bg-[#F3F4F6]',
                    r === user.role && 'bg-primary/[0.06] font-semibold text-primary',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <UserCheck size={13} className={r === user.role ? 'text-primary' : 'text-muted'} />
                    {r}
                  </span>
                  {r === user.role && <span className="text-[10px] text-primary">Đang chọn</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* User Info */}
      <div className="hidden items-center gap-2 sm:flex">
        <span className="text-[13px] font-medium text-ink">{user.name}</span>
        <span className="text-[12px] text-muted">({user.email})</span>
      </div>

      {/* Logout Button */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        title="Đăng xuất"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted transition-colors hover:border-[#EF4444]/40 hover:bg-[#EF4444]/[0.08] hover:text-[#EF4444]"
      >
        <LogOut size={15} />
      </button>
    </div>
  );
}
