'use client';

import { Info } from 'lucide-react';
import { projects } from '@/data/projects';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import ProjectCard from './ProjectCard';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function WorkSection() {
  const { t } = useLanguage();

  return (
    <section id="work" className="section">
      <div className="shell">
        <SectionHeading
          eyebrow={t.work.eyebrow}
          title={t.work.title}
          lead={t.work.lead}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          {projects.map((project, i) => (
            <Reveal key={project.id} delay={Math.min(i, 3) * 0.07}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-7 flex items-start gap-3 rounded-xl border border-dashed border-border bg-[#FCFCFD] px-5 py-4 text-[13.5px] text-muted">
            <Info size={17} strokeWidth={1.8} className="mt-0.5 flex-none" />
            <span>{t.work.note}</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
