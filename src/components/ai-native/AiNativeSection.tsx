'use client';

import { aiOutputs, aiPipelineBottom, aiPipelineTop, aiTags } from '@/data/process';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import { Node, VLine } from './PipelineNode';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AiNativeSection() {
  const { t } = useLanguage();

  return (
    <section id="ai" className="section bg-dark text-white">
      <div className="shell grid items-center gap-11 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            className="mb-0"
            dark
            eyebrow={t.aiNative.eyebrow}
            title={t.aiNative.title}
            lead={t.aiNative.lead}
          />

          <Reveal delay={0.1} className="mt-8 flex flex-wrap gap-2.5">
            {aiTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-dark-border bg-white/[0.02] px-3.5 py-2 text-[12.5px] font-medium text-[#C6CBD4]"
              >
                {tag}
              </span>
            ))}
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <div className="rounded-[20px] border border-dark-border bg-dark-2 p-[26px]">
            {aiPipelineTop.map((node, i) => (
              <div key={node.label}>
                {i > 0 && <VLine />}
                <Node {...node} />
              </div>
            ))}

            <VLine />

            <div className="grid grid-cols-2 gap-2 rounded-xl border border-dashed border-dark-border p-3 sm:grid-cols-5">
              {aiOutputs.map((out) => (
                <span
                  key={out}
                  className="rounded-[7px] bg-white/[0.035] px-0.5 py-2.5 text-center font-mono text-[10.5px] text-[#C6CBD4]"
                >
                  {out}
                </span>
              ))}
            </div>

            {aiPipelineBottom.map((node) => (
              <div key={node.label}>
                <VLine />
                <Node {...node} />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
