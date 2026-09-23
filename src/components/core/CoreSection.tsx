'use client';

import SectionHeading from '@/components/ui/SectionHeading';
import CoreStack from './CoreStack';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function CoreSection() {
  const { t } = useLanguage();

  return (
    <section id="core" className="section">
      <div className="shell">
        <SectionHeading
          eyebrow={t.core.eyebrow}
          title={t.core.title}
          lead={t.core.lead}
        />
        <CoreStack />
      </div>
    </section>
  );
}
