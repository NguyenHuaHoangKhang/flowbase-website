'use client';

import { solutionTree, type Shot } from '@/data/case-study';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import MockDashboard from '@/components/ui/MockDashboard';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function CaseStudySection() {
  const { t } = useLanguage();

  const caseFlow = [
    { index: '01', ...t.caseStudy.flow.problem },
    { index: '02', ...t.caseStudy.flow.existing },
    { index: '03', ...t.caseStudy.flow.solution },
    { index: '04', ...t.caseStudy.flow.system },
    { index: '05', ...t.caseStudy.flow.result },
  ];

  const existingSources = [
    'Excel', 'Word', 'Google Sheets', 'PDF', 'CSV',
  ];

  const shots: Shot[] = [
    { screen: 'lecturer', title: t.caseStudy.shots.dashboard.title, caption: t.caseStudy.shots.dashboard.desc },
    { screen: 'profile', title: t.caseStudy.shots.profile.title, caption: t.caseStudy.shots.profile.desc },
    { screen: 'assignment', title: t.caseStudy.shots.assignment.title, caption: t.caseStudy.shots.assignment.desc },
    { screen: 'payment', title: t.caseStudy.shots.payment.title, caption: t.caseStudy.shots.payment.desc },
  ];

  return (
    <section id="case" className="section bg-[#F3F5F8]">
      <div className="shell">
        <SectionHeading
          eyebrow={t.caseStudy.eyebrow}
          title={t.caseStudy.title}
          lead={t.caseStudy.lead}
        />

        <div className="mb-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {caseFlow.map((s, i) => (
            <Reveal as="article" key={s.index} delay={Math.min(i, 4) * 0.06}>
              <div className="h-full rounded-xl border border-border bg-card p-[18px]">
                <span className="mb-2.5 block font-mono text-[10.5px] text-muted">{s.index}</span>
                <b className="mb-1.5 block text-[14.5px] tracking-[-0.02em]">{s.title}</b>
                <p className="text-[12.5px] leading-[1.5] text-muted">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mb-14 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-card border border-border bg-card p-7">
              <h3 className="mb-4 text-lg">{t.caseStudy.existingTitle}</h3>
              <p className="text-[14.5px] text-muted">
                {t.caseStudy.existingDesc}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {existingSources.map((s) => (
                  <span
                    key={s}
                    className="rounded-lg border border-border bg-[#FBFCFD] px-3.5 py-2.5 text-[12.5px] text-[#4b515c]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="h-full rounded-card border border-ink bg-ink p-7 text-white">
              <h3 className="mb-4 text-lg">{t.caseStudy.solutionTitle}</h3>
              <p className="text-[14.5px] text-dark-muted">
                {t.caseStudy.solutionDesc}
              </p>
              <div className="mt-4 font-mono text-[12.5px] leading-[2] text-[#C6CBD4]">
                <div className="text-white">Lecturer</div>
                {solutionTree.map((node, i) => (
                  <div key={node}>
                    {i === solutionTree.length - 1 ? '  └── ' : '  ├── '}
                    {node}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {shots.map((shot, i) => (
            <Reveal as="figure" key={shot.screen} delay={Math.min(i, 3) * 0.07}>
              <MockDashboard screen={shot.screen} />
              <figcaption className="mt-3 text-[13px] text-muted">
                <b className="mb-0.5 block text-sm font-semibold tracking-[-0.01em] text-ink">
                  {shot.title}
                </b>
                {shot.caption || (shot as any).desc}
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
