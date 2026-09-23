import { cn } from '@/lib/utils';

export function Node({
  label,
  meta,
  accent,
  ok,
}: {
  label: string;
  meta: string;
  accent?: boolean;
  ok?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-[10px] border px-4 py-3 text-[13.5px] font-semibold',
        accent && 'border-primary/50 bg-primary/10 text-white',
        ok && 'border-success/40 bg-success/[0.08]',
        !accent && !ok && 'border-dark-border bg-white/[0.025]',
      )}
    >
      {label}
      <small className="font-mono text-[10.5px] font-normal text-dark-muted">{meta}</small>
    </div>
  );
}

export function VLine({ dark = true }: { dark?: boolean }) {
  return (
    <div className="flex h-[26px] justify-center" aria-hidden>
      <span className={cn('w-px', dark ? 'bg-dark-border' : 'bg-border')} />
    </div>
  );
}
