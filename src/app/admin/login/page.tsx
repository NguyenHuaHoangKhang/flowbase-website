'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, UserCheck, Eye, EyeOff, Sparkles, Lock } from 'lucide-react';
import { Button, Input, FormField } from '@/components/admin/ui';

const TEST_ACCOUNTS = [
  {
    role: 'OWNER',
    name: 'Trần Quốc Việt',
    email: 'owner@flowbase.studio',
    badgeTone: 'bg-primary/10 text-primary border-primary/20',
    desc: 'Toàn quyền (Tài chính, Lead, Dự án, Users)',
    icon: '👑',
  },
  {
    role: 'ADMIN',
    name: 'Nguyễn Minh Huy',
    email: 'admin@flowbase.studio',
    badgeTone: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    desc: 'Quản trị vận hành (trừ User & Billing settings)',
    icon: '🛡️',
  },
  {
    role: 'EDITOR',
    name: 'Lê Hoàng Nam',
    email: 'editor@flowbase.studio',
    badgeTone: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    desc: 'Quản lý Demo, Lead & Dự án (Ẩn Tài chính)',
    icon: '✏️',
  },
  {
    role: 'VIEWER',
    name: 'Phạm Thu Hà',
    email: 'viewer@flowbase.studio',
    badgeTone: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
    desc: 'Chỉ xem dữ liệu, không có quyền tạo/sửa',
    icon: '👁️',
  },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quickLoadingRole, setQuickLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, next }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Đăng nhập thất bại.');
        setLoading(false);
        return;
      }

      router.push(data.redirectTo || next);
      router.refresh();
    } catch {
      setError('Lỗi kết nối máy chủ. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: string) => {
    setQuickLoadingRole(role);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, next }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Không thể đăng nhập bằng tài khoản mẫu.');
        setQuickLoadingRole(null);
        return;
      }

      router.push(data.redirectTo || next);
      router.refresh();
    } catch {
      setError('Lỗi kết nối máy chủ.');
      setQuickLoadingRole(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F9FB] px-4 py-12 selection:bg-primary/20 sm:px-6 lg:px-8">
      {/* Background Decor */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/[0.05] to-transparent blur-3xl" />
      </div>

      <div className="w-full max-w-[480px]">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block text-2xl font-extrabold tracking-tight text-ink">
            FLOWBASE <span className="text-primary">/</span>
            <span className="ml-1.5 font-mono text-[13px] font-normal text-muted">admin</span>
          </Link>
          <p className="mt-2 text-sm text-muted">
            Hệ thống Quản trị & Điều hành Studio
          </p>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-[20px] border border-border bg-card p-6 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.07)] sm:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
            <h1 className="text-lg font-bold text-ink">Đăng nhập tài khoản</h1>
            <span className="flex items-center gap-1 font-mono text-[11px] text-muted">
              <Lock size={12} /> SSL 256-bit
            </span>
          </div>

          {error && (
            <div className="mb-5 rounded-[10px] border border-[#EF4444]/30 bg-[#EF4444]/[0.08] p-3 text-xs font-medium text-[#B91C1C]">
              {error}
            </div>
          )}

          {/* Standard Login Form */}
          <form onSubmit={handleStandardLogin} className="space-y-4">
            <FormField label="Email" required id="email">
              <Input
                id="email"
                type="email"
                placeholder="name@flowbase.studio"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading || !!quickLoadingRole}
              />
            </FormField>

            <FormField label="Mật khẩu" required id="password">
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading || !!quickLoadingRole}
                  rightIcon={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted transition-colors hover:text-ink"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
              </div>
            </FormField>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              disabled={!!quickLoadingRole}
            >
              Đăng nhập
            </Button>
          </form>

          {/* Dev Sandbox: Quick Role Switcher */}
          <div className="mt-8 border-t border-border pt-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                <Sparkles size={13} className="text-amber-500" />
                Kiểm thử nhanh phân quyền (Dev Sandbox)
              </span>
              <span className="rounded bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                1-Click
              </span>
            </div>
            <p className="mb-3 text-[12px] text-muted">
              Chọn 1 vai trò bên dưới để đăng nhập tức thì và kiểm tra ma trận RBAC:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {TEST_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleQuickLogin(acc.role)}
                  disabled={loading || !!quickLoadingRole}
                  className="flex flex-col items-start rounded-[12px] border border-border bg-[#FBFCFD] p-3 text-left transition-all hover:border-primary/40 hover:bg-white hover:shadow-sm active:scale-[0.98] disabled:opacity-60"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-base">{acc.icon}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${acc.badgeTone}`}
                    >
                      {acc.role}
                    </span>
                  </div>
                  <b className="mt-2 block truncate text-[13px] font-semibold text-ink">
                    {acc.name}
                  </b>
                  <span className="mt-0.5 block line-clamp-2 text-[11px] text-muted">
                    {acc.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            ← Quay lại website FLOWBASE
          </Link>
        </div>
      </div>
    </div>
  );
}
