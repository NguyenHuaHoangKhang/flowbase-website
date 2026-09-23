'use client';

import { Table2, Copy, Workflow, Database, Clock } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import { Card, IconBox } from '@/components/ui/Card';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ProblemSection() {
  const { t } = useLanguage();

  const dynamicProblems = [
    { ...t.problem.cards.spreadsheets, icon: Table2 },
    { ...t.problem.cards.dataEntry, icon: Copy },
    { ...t.problem.cards.workflows, icon: Workflow },
    { ...t.problem.cards.sourceOfTruth, icon: Database },
    { ...t.problem.cards.reporting, icon: Clock },
  ];

  return (
    <section id="problem" className="section">
      <div className="shell">
        <SectionHeading
          eyebrow={t.problem.eyebrow}
          title={t.problem.title}
          lead={t.problem.lead}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dynamicProblems.map((p, i) => (
            <Reveal as="article" key={p.title} delay={Math.min(i, 5) * 0.055}>
              <Card className="h-full">
                <IconBox>
                  <p.icon size={19} strokeWidth={1.8} />
                </IconBox>
                <h3 className="mb-2 text-[17px] tracking-[-0.025em]">{p.title}</h3>
                <p className="text-[14.5px] leading-[1.6] text-muted">{p.desc}</p>
              </Card>
            </Reveal>
          ))}

          <Reveal delay={0.3}>
            <div className="flex h-full flex-col justify-center rounded-card bg-ink p-7 text-white">
              <b className="mb-2 block text-base tracking-[-0.02em]">
                {t.problem.conclusion.title}
              </b>
              <p className="text-[14.5px] text-dark-muted">
                {t.problem.conclusion.desc}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
