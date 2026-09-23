'use client';

import { Building2, GitBranch, BarChart3, FileSpreadsheet, Wrench, Bot } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import { Card, IconBox } from '@/components/ui/Card';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function SolutionsSection() {
  const { t } = useLanguage();

  const dynamicSolutions = [
    { ...t.solutions.cards.businessMsg, icon: Building2 },
    { ...t.solutions.cards.workflow, icon: GitBranch },
    { ...t.solutions.cards.data, icon: BarChart3 },
    { ...t.solutions.cards.excel, icon: FileSpreadsheet },
    { ...t.solutions.cards.internalTools, icon: Wrench },
    { ...t.solutions.cards.ai, icon: Bot },
  ];

  return (
    <section id="solutions" className="section">
      <div className="shell">
        <SectionHeading
          eyebrow={t.solutions.eyebrow}
          title={t.solutions.title}
          lead={t.solutions.lead}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dynamicSolutions.map((s, i) => (
            <Reveal as="article" key={s.title} delay={Math.min(i, 5) * 0.055}>
              <Card className="group flex h-full min-h-[222px] flex-col">
                <IconBox>
                  <s.icon size={19} strokeWidth={1.8} />
                </IconBox>
                <h3 className="mb-2.5 text-lg">{s.title}</h3>
                <p className="flex-1 text-[14.5px] text-muted">{s.desc}</p>
                <span className="mt-[18px] flex items-center gap-[7px] text-[13px] font-semibold text-primary opacity-55 transition-all duration-[250ms] group-hover:gap-[11px] group-hover:opacity-100">
                  {t.solutions.explore}
                </span>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
