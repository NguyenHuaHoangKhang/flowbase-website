import { cn } from '@/lib/utils';

export default function Chip({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'module' | 'lit';
}) {
  return (
    <span
      className={cn(
        'rounded-[7px] border px-[11px] py-1.5 text-xs font-medium transition-all duration-[250ms]',
        tone === 'default' && 'border-border bg-white text-[#40454f]',
        tone === 'module' && 'border-primary/30 bg-primary/[0.06] text-primary',
        tone === 'lit' && 'border-primary bg-primary text-white',
      )}
    >
      {children}
    </span>
  );
}
