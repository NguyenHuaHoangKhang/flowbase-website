import { cn } from '@/lib/utils';
import { mockScreens, type BadgeTone, type Cell, type MockKey } from '@/data/dashboards';

const toneClass: Record<BadgeTone, string> = {
  ok: 'bg-success/[0.12] text-[#15803D]',
  wait: 'bg-[#F59E0B]/[0.14] text-[#B45309]',
  new: 'bg-primary/10 text-primary',
  off: 'bg-[#F1F3F6] text-muted',
};

const chartBars = [40, 62, 48, 74, 58, 88, 100];

function renderCell(cell: Cell, key: number) {
  if (typeof cell === 'string') return <td key={key} className="border-b border-[#F1F3F6] p-[7px] text-[10px]">{cell}</td>;
  return (
    <td key={key} className="border-b border-[#F1F3F6] p-[7px]">
      <span className={cn('inline-block rounded-full px-[7px] py-0.5 text-[8.5px] font-semibold', toneClass[cell.tone])}>
        {cell.badge}
      </span>
    </td>
  );
}

/**
 * Mock SaaS dashboard dùng chung cho Work cards và Case study screenshots.
 * Render từ data — không hard-code từng màn hình.
 */
export default function MockDashboard({ screen }: { screen: MockKey }) {
  const s = mockScreens[screen];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white text-[11px] leading-[1.35]">
      <div className="flex items-center gap-1.5 border-b border-border bg-[#FBFCFD] px-[11px] py-[9px]">
        <i className="h-2 w-2 rounded-full bg-border" />
        <i className="h-2 w-2 rounded-full bg-border" />
        <i className="h-2 w-2 rounded-full bg-border" />
        <b className="ml-1.5 font-mono text-[10.5px] font-semibold text-muted">{s.windowTitle}</b>
      </div>

      <div className="grid min-h-[196px] grid-cols-[62px_1fr] sm:grid-cols-[78px_1fr]">
        <div className="flex flex-col gap-[7px] border-r border-border bg-[#FCFCFD] px-[9px] py-[11px]">
          {s.nav.map((item, i) => (
            <span
              key={item}
              className={cn(
                'rounded-[5px] px-1.5 py-1 text-[10px] text-muted',
                i === s.activeNav && 'bg-primary/[0.09] font-semibold text-primary',
              )}
            >
              {item}
            </span>
          ))}
        </div>

        <div className="p-3">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <b className="text-[12px] font-bold">{s.title}</b>
            <em className="font-mono text-[9.5px] not-italic text-muted">{s.meta}</em>
          </div>

          <div className="mb-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {s.kpis.map((k) => (
              <div key={k.label} className="rounded-[7px] border border-border px-2 py-[7px]">
                <b className="block text-[13px] font-extrabold tracking-[-0.02em]">{k.value}</b>
                <span className="text-[8.5px] text-muted">{k.label}</span>
              </div>
            ))}
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr>
                {s.columns.map((c) => (
                  <th
                    key={c}
                    className="border-b border-border p-[6px_7px] text-left text-[9px] font-semibold uppercase tracking-[0.06em] text-muted"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.rows.map((row, i) => (
                <tr key={i}>{row.map((cell, j) => renderCell(cell, j))}</tr>
              ))}
            </tbody>
          </table>

          {s.chart && (
            <div className="mt-2.5 flex h-[52px] items-end gap-1">
              {chartBars.map((h, i) => (
                <i
                  key={i}
                  style={{ height: `${h}%` }}
                  className={cn(
                    'flex-1 rounded-t-[2px]',
                    i === chartBars.length - 1 ? 'bg-primary' : 'bg-primary/[0.18]',
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
