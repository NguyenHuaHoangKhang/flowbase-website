import { Inbox } from 'lucide-react';

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <Inbox size={24} className="mb-3 text-muted" strokeWidth={1.6} />
      <b className="text-[15px]">{title}</b>
      {description && <p className="mt-1.5 max-w-[46ch] text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
