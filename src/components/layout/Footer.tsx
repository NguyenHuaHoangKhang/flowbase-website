'use client';

import { navItems } from '@/data/navigation';
import { CONTACT_EMAIL } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Footer() {
  const { t, mounted } = useLanguage();

  return (
    <footer className="border-t border-dark-border bg-dark pb-10 pt-[72px] text-white">
      <div className="shell">
        <p className="mb-12 text-[34px] font-extrabold leading-[1.2] tracking-[-0.03em] sm:text-[56px] lg:text-[88px]">
          {t.footer.titleLine1}
          <br />
          <span className="text-[#2f333c]">{t.footer.titleLine2}</span>
        </p>

        <div className="grid gap-9 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] lg:gap-12">
          <div>
            <span className="text-xl font-extrabold tracking-[-0.03em]">
              FLOWBASE <span className="text-primary">/</span>
            </span>
            <p className="mt-3.5 max-w-[34ch] text-[14.5px] text-dark-muted">
              {t.footer.subtitle}
            </p>
          </div>

          <div>
            <span className="mb-4 block font-mono text-[10.5px] tracking-[0.1em] text-[#5f6673]">
              {t.footer.siteLabel}
            </span>
            {navItems.map((item) => {
              const keys: Record<string, keyof typeof t.nav> = {
                '03': 'solutions',
                '04': 'process',
                '05': 'aiDev',
                '06': 'core',
                '07': 'work',
                '09': 'technology',
              };
              const label = mounted ? t.nav[keys[item.index]] || item.label : item.label;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="block py-1.5 text-[14.5px] text-[#C6CBD4] transition-colors hover:text-white"
                >
                  {label}
                </a>
              );
            })}
          </div>

          <div>
            <span className="mb-4 block font-mono text-[10.5px] tracking-[0.1em] text-[#5f6673]">
              {t.footer.contactLabel}
            </span>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="block py-1.5 text-[14.5px] text-[#C6CBD4] transition-colors hover:text-white"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap justify-between gap-4 border-t border-dark-border pt-6 text-[13px] text-[#5f6673]">
          <span>{t.footer.copyright}</span>
          <span>{t.footer.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
