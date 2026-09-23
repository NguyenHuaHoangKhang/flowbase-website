import { cn } from '@/lib/utils';

export default function KpiCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'default' | 'warning' | 'danger' | 'success';
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <span className="text-[12.5px] text-muted">{label}</span>
      <b
        className={cn(
          'mt-1.5 block text-[24px] font-extrabold tracking-[-0.03em]',
          tone === 'warning' && 'text-[#B45309]',
          tone === 'danger' && 'text-[#B91C1C]',
          tone === 'success' && 'text-[#15803D]',
        )}
      >
        {value}
      </b>
      {hint && <span className="mt-0.5 block text-[12px] text-muted">{hint}</span>}
    </div>
  );
}
