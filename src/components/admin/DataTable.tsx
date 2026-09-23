import Link from 'next/link';
import { cn } from '@/lib/utils';
import EmptyState from './EmptyState';

export type Column<T> = {
  key: string;
  header: string;
  /** Nội dung ô. Trả về ReactNode để nhúng badge, link, số tiền... */
  cell: (row: T) => React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
};

export default function DataTable<T extends { id: string }>({
  columns,
  rows,
  rowHref,
  empty,
}: {
  columns: Column<T>[];
  rows: T[];
  rowHref?: (row: T) => string;
  empty?: { title: string; description?: string; action?: React.ReactNode };
}) {
  if (!rows.length) {
    return (
      <EmptyState
        title={empty?.title ?? 'Chưa có dữ liệu'}
        description={empty?.description}
        action={empty?.action}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  'whitespace-nowrap border-b border-border px-4 py-3 text-left text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted',
                  c.align === 'right' && 'text-right',
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-[#FBFCFD]">
              {columns.map((c, i) => {
                const content =
                  rowHref && i === 0 ? (
                    <Link href={rowHref(row)} className="font-semibold text-ink hover:text-primary">
                      {c.cell(row)}
                    </Link>
                  ) : (
                    c.cell(row)
                  );
                return (
                  <td
                    key={c.key}
                    className={cn(
                      'border-b border-[#F1F3F6] px-4 py-3 align-middle',
                      c.align === 'right' && 'text-right tabular-nums',
                      c.className,
                    )}
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
