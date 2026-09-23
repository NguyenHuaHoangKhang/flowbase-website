import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'secondary-dark';

const base =
  'inline-flex h-12 items-center justify-center gap-2 rounded-btn px-[22px] text-[15px] font-semibold tracking-[-0.01em] transition-all duration-200 group';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover hover:-translate-y-0.5',
  secondary:
    'bg-card text-ink border border-border hover:border-[#c9cfd8] hover:-translate-y-0.5',
  'secondary-dark':
    'bg-transparent text-white border border-dark-border hover:border-[#41474f] hover:-translate-y-0.5',
};

export function Button({
  href,
  variant = 'primary',
  arrow = false,
  className,
  children,
  type,
}: {
  href?: string;
  variant?: Variant;
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
  type?: 'button' | 'submit';
}) {
  const content = (
    <>
      {children}
      {arrow && (
        <span className="transition-transform duration-200 group-hover:translate-x-[3px]">
          →
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn(base, variants[variant], className)}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type ?? 'button'} className={cn(base, variants[variant], className)}>
      {content}
    </button>
  );
}
