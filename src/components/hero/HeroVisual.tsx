'use client';

import { useEffect, useState } from 'react';
import { FileSpreadsheet, Table2, MessageCircle, Mail, FileText } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Counter from '@/components/ui/Counter';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const sources = [
  { label: 'Excel', Icon: FileSpreadsheet },
  { label: 'Sheets', Icon: Table2 },
  { label: 'Zalo', Icon: MessageCircle },
  { label: 'Email', Icon: Mail },
  { label: 'Paper', Icon: FileText },
];

const bars = [38, 56, 44, 72, 60, 84, 100];

function Pipe({ delay = 0 }: { delay?: number }) {
  return (
    <div className="relative flex h-[34px] items-center justify-center">
      <span className="h-full w-px bg-border" />
      <span
        className="absolute h-[5px] w-[5px] animate-drop rounded-full bg-primary"
        style={{ animationDelay: `${delay}s` }}
      />
    </div>
  );
}

export default function HeroVisual() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setActive((i) => (i + 1) % sources.length), 1100);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <div
      aria-hidden
      className="rounded-[20px] border border-border bg-card p-4 shadow-[0_1px_2px_rgba(17,19,24,.04),0_18px_40px_-24px_rgba(17,19,24,.18)] sm:p-[22px]"
    >
      <div className="mb-5 flex items-center gap-[7px] border-b border-border pb-4">
        <i className="h-[9px] w-[9px] rounded-full bg-border" />
        <i className="h-[9px] w-[9px] rounded-full bg-border" />
        <i className="h-[9px] w-[9px] rounded-full bg-border" />
        <b className="ml-2 font-mono text-[11px] font-medium text-muted">{t.hero.pipeline}</b>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {sources.map(({ label, Icon }, i) => (
          <div
            key={label}
            className={cn(
              'rounded-[10px] border px-1.5 py-2.5 text-center text-[11px] font-semibold transition-all duration-300',
              i === active
                ? 'border-primary/45 bg-primary/[0.06] text-primary'
                : 'border-border bg-[#FBFCFD] text-muted',
            )}
          >
            <Icon size={16} className="mx-auto mb-1.5 opacity-85" strokeWidth={1.8} />
            {label}
          </div>
        ))}
      </div>

      <Pipe />

      <div className="flex items-center justify-between gap-3 rounded-xl border border-ink bg-ink px-4 py-3.5 text-white">
        <b className="text-sm font-bold tracking-[-0.02em]">FLOWBASE</b>
        <span className="flex items-center gap-1.5 font-mono text-[10.5px] text-[#7f8794]">
          <i className="h-[5px] w-[5px] animate-blink rounded-full bg-success" />
          {t.hero.mapping}
        </span>
      </div>

      <Pipe delay={0.6} />

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <b className="text-xs font-bold">{t.hero.overview}</b>
          <span className="font-mono text-[10px] text-muted">{t.hero.demoData}</span>
        </div>

        <div className="grid grid-cols-3 gap-px bg-border">
          <div className="bg-white p-3">
            <b className="block text-[19px] font-extrabold tracking-[-0.03em]">
              <Counter value={1284} />
            </b>
            <span className="text-[10.5px] text-muted">{t.hero.records}</span>
          </div>
          <div className="bg-white p-3">
            <b className="block text-[19px] font-extrabold tracking-[-0.03em]">
              <Counter value={38} />
            </b>
            <span className="text-[10.5px] text-muted">{t.hero.pending}</span>
          </div>
          <div className="bg-white p-3">
            <b className="block text-[19px] font-extrabold tracking-[-0.03em]">
              <Counter value={126} />
            </b>
            <span className="text-[10.5px] text-muted">{t.hero.approved}</span>
          </div>
        </div>

        <div className="flex h-16 items-end gap-1.5 border-t border-border px-3 py-3.5">
          {bars.map((h, i) => (
            <i
              key={i}
              style={{ height: `${h}%` }}
              className={cn(
                'flex-1 rounded-t-[3px]',
                i === bars.length - 1 ? 'bg-primary' : 'bg-primary/[0.16]',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
