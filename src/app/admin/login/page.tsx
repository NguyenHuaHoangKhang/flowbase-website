'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, UserCheck, Eye, EyeOff, Sparkles, Lock } from 'lucide-react';
import { Button, Input, FormField } from '@/components/admin/ui';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
                disabled={loading}
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
                  disabled={loading}
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
            >
              Đăng nhập
            </Button>
          </form>

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
