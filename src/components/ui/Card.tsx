import { cn } from '@/lib/utils';

export function Card({
  className,
  children,
  hover = true,
}: {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-card border border-border bg-card p-7 transition-all duration-[250ms]',
        hover &&
          'hover:-translate-y-1 hover:border-[#d6dbe3] hover:shadow-[0_12px_28px_-20px_rgba(17,19,24,.35)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-[18px] flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-border bg-[#FBFCFD] text-primary">
      {children}
    </span>
  );
}
