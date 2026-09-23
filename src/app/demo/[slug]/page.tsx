import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Lock, ShieldAlert } from 'lucide-react';
import { checkDemoAccess } from '@/server/repositories';
import MockDashboard from '@/components/ui/MockDashboard';
import type { MockKey } from '@/data/dashboards';

/**
 * Trang public để khách xem demo.
 *
 * Quyền xem quyết định bởi checkDemoAccess():
 *   PUBLIC / UNLISTED → xem thẳng
 *   PASSWORD          → cần nhập mật khẩu
 *   GRANT_ONLY        → cần token trong query (?t=...)
 *
 * Ghi nhận lượt xem (DemoView) và tăng viewCount trong cùng transaction.
 */
export default async function DemoViewerPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { t?: string; p?: string };
}) {
  const headerList = headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0].trim() || headerList.get('x-real-ip') || '127.0.0.1';
  const userAgent = headerList.get('user-agent') || undefined;
  const referrer = headerList.get('referer') || undefined;

  const { allowed, reason, demo } = await checkDemoAccess(params.slug, {
    token: searchParams.t,
    password: searchParams.p,
    ip,
    userAgent,
    referrer,
  });

  if (!demo || reason === 'not-found') notFound();

  if (!allowed) {
    const messages: Record<string, string> = {
      'not-published': 'Demo này chưa được xuất bản.',
      'password-required': 'Demo này cần mật khẩu để xem.',
      'token-required': 'Demo này chỉ mở cho người được cấp quyền. Dùng đúng link đã nhận qua email.',
      'invalid-token': 'Link không hợp lệ.',
      revoked: 'Quyền xem đã bị thu hồi.',
      expired: 'Link đã hết hạn.',
      'view-limit': 'Link đã đạt số lượt xem tối đa.',
    };

    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <div className="w-full max-w-[440px] rounded-card border border-border bg-card p-8 text-center">
          <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-[#FBFCFD]">
            {reason === 'password-required' ? <Lock size={19} /> : <ShieldAlert size={19} />}
          </span>
          <h1 className="text-xl">{demo.title}</h1>
          <p className="mt-2.5 text-sm text-muted">
            {messages[reason ?? ''] ?? 'Bạn không có quyền xem demo này.'}
          </p>

          {reason === 'password-required' && (
            <form className="mt-6 flex gap-2" action={`/demo/${params.slug}`}>
              <input
                name="p"
                type="password"
                placeholder="Nhập mật khẩu"
                className="h-11 flex-1 rounded-[10px] border border-border bg-white px-3.5 text-sm outline-none focus:border-primary"
              />
              <button className="h-11 rounded-[10px] bg-primary px-4 text-sm font-semibold text-white">
                Xem
              </button>
            </form>
          )}

          <Link href="/#contact" className="mt-6 inline-block text-sm font-semibold text-primary">
            Liên hệ FLOWBASE để được cấp quyền →
          </Link>
        </div>
      </main>
    );
  }

  // slug của demo trùng với key màn hình mock đã dựng ở phần website
  const screenMap: Record<string, MockKey> = {
    'lecturer-management': 'lecturer',
    'training-center': 'training',
    'hr-management': 'hr',
    'workflow-management': 'workflow',
  };
  const screen = screenMap[demo.slug];

  return (
    <main className="mx-auto w-full max-w-shell px-5 py-12 sm:px-6">
      <Link href="/#work" className="text-sm font-semibold text-primary">
        ← Tất cả demo
      </Link>

      <header className="mb-8 mt-5">
        <span className="font-mono text-[12px] text-muted">{demo.category}</span>
        <h1 className="mt-2 text-[clamp(28px,5vw,44px)] tracking-[-0.035em]">{demo.title}</h1>
        <p className="mt-3 max-w-[62ch] text-muted">{demo.summary}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {demo.techStack.map((t) => (
            <span key={t} className="rounded-md bg-[#F3F5F8] px-2.5 py-1 text-[12px] font-medium text-[#4b515c]">
              {t}
            </span>
          ))}
        </div>
      </header>

      <div className="rounded-card border border-border bg-gradient-to-b from-[#F3F5F8] to-[#FAFBFC] p-5">
        {screen ? (
          <MockDashboard screen={screen} />
        ) : (
          <p className="py-16 text-center text-sm text-muted">
            Demo này chưa gắn màn hình xem trước.
          </p>
        )}
      </div>

      <p className="mt-5 rounded-xl border border-dashed border-border px-5 py-4 text-[13px] text-muted">
        Đây là bản demo do FLOWBASE dựng với dữ liệu mẫu, không phải hệ thống đang chạy của khách hàng.
      </p>
    </main>
  );
}
