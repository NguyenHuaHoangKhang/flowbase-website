import Link from 'next/link';
import { cn } from '@/lib/utils';

const styles = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'border border-border bg-card text-ink hover:border-[#c9cfd8]',
  danger: 'border border-[#EF4444]/30 bg-[#EF4444]/[0.06] text-[#B91C1C] hover:bg-[#EF4444]/10',
};

export default function AdminButton({
  href,
  variant = 'secondary',
  size = 'md',
  className,
  children,
}: {
  href?: string;
  variant?: keyof typeof styles;
  size?: 'sm' | 'md';
  className?: string;
  children: React.ReactNode;
}) {
  const cls = cn(
    'inline-flex items-center justify-center gap-1.5 rounded-[10px] font-semibold transition-colors',
    size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-10 px-4 text-sm',
    styles[variant],
    className,
  );
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button type="button" className={cls}>{children}</button>;
}
