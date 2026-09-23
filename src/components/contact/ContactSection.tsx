import { CONTACT_EMAIL } from '@/lib/utils';
'use client';

import { CheckCircle2, Clock } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import ContactForm from './ContactForm';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ContactSection() {
  const { t } = useLanguage();

  return (
    <section id="contact" className="section relative bg-white">
      <div className="shell grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            className="mb-10"
            eyebrow={t.contact.eyebrow}
            title={t.contact.title}
            lead={t.contact.lead}
          />

          <Reveal delay={0.1}>
            <div className="flex max-w-[400px] flex-col gap-4 rounded-xl border border-border bg-[#FCFCFD] p-5">
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 flex-none text-muted" size={18} strokeWidth={1.8} />
                <div>
                  <b className="block text-sm text-ink">{t.contact.responseLabel}</b>
                  <p className="text-[13.5px] text-muted">{t.contact.responseValue}</p>
                </div>
              </div>
              <div className="h-px bg-border" aria-hidden />
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 flex-none text-muted" size={18} strokeWidth={1.8} />
                <p className="text-[13.5px] text-muted">
                  {t.contact.noCommitment}
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <div className="rounded-[20px] border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
