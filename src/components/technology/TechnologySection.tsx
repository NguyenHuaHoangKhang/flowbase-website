'use client';

import { architecture, dataLayer, techGroups } from '@/data/technology';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import Chip from '@/components/ui/Chip';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

function ArchNode({ label, meta, accent }: { label: string; meta: string; accent?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-[10px] border px-[15px] py-3 text-[13.5px] font-semibold',
        accent ? 'border-primary/35 bg-primary/[0.06] text-primary' : 'border-border bg-[#FBFCFD]',
      )}
    >
      {label}
      <small className="font-mono text-[10px] font-normal text-muted">{meta}</small>
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

export default function TechnologySection() {
  const { t } = useLanguage();

  return (
    <section id="technology" className="section">
      <div className="shell">
        <SectionHeading 
          eyebrow={t.technology.eyebrow} 
          title={t.technology.title} 
        />

        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-3.5 sm:grid-cols-2">
            {techGroups.map((group, i) => (
              <Reveal key={group.label} delay={Math.min(i, 5) * 0.05}>
                <div className="h-full rounded-xl border border-border bg-card p-[18px]">
                  <span className="mb-3 block font-mono text-[10.5px] tracking-[0.08em] text-muted">
                    {group.label}
                  </span>
                  <div className="flex flex-wrap gap-[7px]">
                    {group.items.map((item) => (
                      <Chip key={item}>{item}</Chip>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="rounded-card border border-border bg-card p-6">
              {architecture.map((node, i) => (
                <div key={node.label}>
                  {i > 0 && <Connector />}
                  <ArchNode {...node} />
                </div>
              ))}
              <Connector />
              <div className="grid gap-2.5 sm:grid-cols-2">
                {dataLayer.map((node) => (
                  <ArchNode key={node.label} {...node} />
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
