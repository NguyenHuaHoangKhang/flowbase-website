import { cn } from '@/lib/utils';
import Reveal from './Reveal';

export default function SectionHeading({
  eyebrow,
  title,
  lead,
  dark = false,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <Reveal className={cn('mb-14 max-w-[760px]', className)}>
      <span
        className={cn(
          'mb-5 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.12em]',
          dark ? 'text-dark-muted' : 'text-muted',
        )}
      >
        <span
          className={cn('h-px w-[22px]', dark ? 'bg-dark-border' : 'bg-border')}
          aria-hidden
        />
        {eyebrow}
      </span>
      <h2 className="h2">{title}</h2>
      {lead && <p className={cn('lead', dark && 'lead-dark')}>{lead}</p>}
    </Reveal>
  );
}
