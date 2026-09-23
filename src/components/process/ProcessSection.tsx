'use client';

import { motion, useReducedMotion } from 'framer-motion';
import SectionHeading from '@/components/ui/SectionHeading';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ProcessSection() {
  const reduce = useReducedMotion();
  const { t } = useLanguage();

  const dynamicSteps = [
    { index: '01', ...t.process.steps.discover },
    { index: '02', ...t.process.steps.map },
    { index: '03', ...t.process.steps.prototype },
    { index: '04', ...t.process.steps.build },
    { index: '05', ...t.process.steps.test },
    { index: '06', ...t.process.steps.deploy },
  ];

  return (
    <section id="process" className="section">
      <div className="shell">
        <SectionHeading
          eyebrow={t.process.eyebrow}
          title={t.process.title}
          lead={t.process.lead}
        />

        <div className="grid gap-3 md:grid-cols-2 md:gap-0 md:border-l md:border-t md:border-border lg:grid-cols-3">
          {dynamicSteps.map((step, i) => (
            <motion.article
              key={step.index}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.5, delay: Math.min(i, 5) * 0.07 }}
              className="rounded-xl border border-border bg-card p-[26px_22px] md:rounded-none md:border-l-0 md:border-t-0 md:p-[34px_28px]"
            >
              <span className="mb-[22px] block font-mono text-xs font-medium text-primary">
                {step.index}
              </span>

              <div className="mb-[22px] h-0.5 overflow-hidden bg-border">
                <motion.div
                  className="h-full bg-primary"
                  initial={reduce ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.15 + Math.min(i, 5) * 0.07, ease: [0.2, 0.7, 0.3, 1] }}
                  style={{ transformOrigin: 'left' }}
                />
              </div>

              <h3 className="mb-2.5 text-[19px]">{step.title}</h3>
              <p className="text-[14.5px] text-muted">{step.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
