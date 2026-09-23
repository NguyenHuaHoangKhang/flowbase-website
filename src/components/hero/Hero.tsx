'use client';

import { Button } from '@/components/ui/Button';
import Counter from '@/components/ui/Counter';
import HeroVisual from './HeroVisual';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();

  const meta = [
    { value: 6, label: t.hero.stat1 },
    { value: 15, label: t.hero.stat2 },
    { value: 4, label: t.hero.stat3 },
  ];

  return (
    <section id="hero" className="pb-16 pt-32 lg:pb-24 lg:pt-[172px]">
      <div className="shell grid items-center gap-11 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-3.5 py-[7px] text-xs font-semibold uppercase tracking-[0.1em] text-muted">
            <i className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_0_3px_rgba(34,197,94,.18)]" />
            {t.hero.eyebrow}
          </span>

          <h1 className="mt-6 text-[clamp(38px,8vw,84px)] leading-[1.2] tracking-tight">
            {t.hero.titleLine1}
            <span className="block">{t.hero.titleLine2}</span>
          </h1>

          <p className="mt-6 max-w-[46ch] text-[16.5px] leading-[1.6] text-muted sm:text-lg">
            {t.hero.lead}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button href="#contact" arrow>
              {t.hero.startProjectBtn}
            </Button>
            <Button href="#work" variant="secondary">
              {t.hero.viewWorkBtn}
            </Button>
          </div>

          <div className="mt-11 flex flex-wrap gap-6 border-t border-border pt-6 sm:gap-9">
            {meta.map((m) => (
              <div key={m.label}>
                <b className="block text-[22px] font-extrabold tracking-[-0.03em]">
                  <Counter value={m.value} />
                </b>
                <span className="text-[13px] text-muted">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}
