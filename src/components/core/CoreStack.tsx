'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { coreModules, domains, infrastructure, type DomainKey } from '@/data/core';
import { cn } from '@/lib/utils';
import Chip from '@/components/ui/Chip';

function Layer({
  label,
  className,
  labelClassName,
  children,
}: {
  label: string;
  className?: string;
  labelClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('rounded-xl border border-border bg-[#FBFCFD] px-[18px] py-4', className)}>
      <span className={cn('mb-3 block font-mono text-[10.5px] tracking-[0.1em] text-muted', labelClassName)}>
        {label}
      </span>
      {children}
    </div>
  );
}

export default function CoreStack() {
  const [active, setActive] = useState<DomainKey>('hr');
  const domain = domains.find((d) => d.key === active)!;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr] lg:gap-10">
      <div
        role="tablist"
        aria-label="Business domain"
        className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
      >
        {domains.map((d) => (
          <button
            key={d.key}
            role="tab"
            aria-selected={d.key === active}
            onClick={() => setActive(d.key)}
            className={cn(
              'min-w-[172px] flex-none rounded-xl border px-4 py-3.5 text-left transition-colors duration-200 lg:min-w-0 lg:flex-auto',
              d.key === active
                ? 'border-primary bg-primary/[0.045]'
                : 'border-border bg-card hover:border-[#c9cfd8]',
            )}
          >
            <b
              className={cn(
                'block text-[15px] font-bold tracking-[-0.02em]',
                d.key === active && 'text-primary',
              )}
            >
              {d.label}
            </b>
            <span className="text-[12.5px] text-muted">{d.caption}</span>
          </button>
        ))}
      </div>

      <div>
        <div className="rounded-card border border-border bg-card p-6">
          <Layer
            label="APPLICATION"
            className="border-ink bg-ink text-white"
            labelClassName="text-[#7f8794]"
          >
            <b className="text-base tracking-[-0.02em]">{domain.application}</b>
          </Layer>

          <Connector />

          <Layer label="BUSINESS MODULES">
            <div className="flex flex-wrap gap-[7px]">
              {domain.modules.map((m) => (
                <Chip key={m} tone="module">
                  {m}
                </Chip>
              ))}
            </div>
          </Layer>

          <Connector />

          <Layer label="FLOWBASE CORE — REUSABLE" className="border-primary/30 bg-primary/[0.05]">
            <div className="flex flex-wrap gap-[7px]">
              {coreModules.map((m) => (
                <Chip key={m} tone={domain.uses.includes(m) ? 'lit' : 'default'}>
                  {m}
                </Chip>
              ))}
            </div>
          </Layer>

          <Connector />

          <Layer label="INFRASTRUCTURE">
            <div className="flex flex-wrap gap-[7px]">
              {infrastructure.map((m) => (
                <Chip key={m}>{m}</Chip>
              ))}
            </div>
          </Layer>
        </div>

        <p className="mt-4 flex items-center gap-2 text-[13px] text-muted">
          <Info size={16} strokeWidth={1.8} className="flex-none" />
          Business modules thay đổi theo từng dự án. FLOWBASE Core và infrastructure giữ nguyên.
        </p>
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex h-[22px] justify-center" aria-hidden>
      <span className="w-px bg-border" />
    </div>
  );
}
