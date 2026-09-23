'use client';

import { useEffect, useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { navItems } from '@/data/navigation';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const { t, mounted: langMounted } = useLanguage();

  useEffect(() => {
    setMounted(true);
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!mounted) return null;

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-[90] bg-ink/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          'fixed bottom-0 right-0 top-0 z-[100] flex w-[min(100%,320px)] flex-col bg-card shadow-2xl transition-transform duration-300 ease-out lg:hidden',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <span className="text-[17px] font-extrabold tracking-[-0.03em]">
            FLOWBASE <span className="text-primary">/</span>
          </span>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted transition-colors hover:text-ink"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-border p-5 bg-[#FBFCFD]">
          <span className="text-[13px] font-semibold text-muted">Language / Ngôn ngữ</span>
          <LanguageSwitcher />
        </div>

        <nav className="flex-1 overflow-y-auto p-5">
          <div className="grid gap-2">
            {navItems.map((item) => {
              const keys: Record<string, keyof typeof t.nav> = {
                '03': 'solutions',
                '04': 'process',
                '05': 'aiDev',
                '06': 'core',
                '07': 'work',
                '09': 'technology',
              };
              const label = langMounted ? t.nav[keys[item.index]] || item.label : item.label;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-xl p-4 text-[15px] font-medium transition-colors hover:bg-ink/[0.045]"
                >
                  {label}
                  <ArrowRight size={16} className="text-muted" />
                </a>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-border p-5">
          <a
            href="#contact"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-[14px] text-[15px] font-semibold text-white transition-colors hover:bg-[#2a2e38]"
          >
            {langMounted ? t.nav.contactBtn : 'Contact →'}
          </a>
        </div>
      </div>
    </>
  );
}
