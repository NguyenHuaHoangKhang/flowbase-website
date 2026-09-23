'use client';

import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { navItems } from '@/data/navigation';
import { cn } from '@/lib/utils';
import MobileMenu from '@/components/navigation/MobileMenu';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Header() {
  const [stuck, setStuck] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, mounted } = useLanguage();

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed left-0 right-0 z-[80] border-b transition-all duration-[250ms]',
          stuck
            ? 'border-border bg-bg/[0.78] backdrop-blur-[14px] backdrop-saturate-150'
            : 'border-transparent bg-transparent',
        )}
        style={{ top: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="shell flex h-[72px] items-center justify-between gap-6">
          <a href="#hero" className="text-[17px] font-extrabold tracking-[-0.03em]">
            FLOWBASE <span className="text-primary">/</span>
          </a>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {navItems.map((item) => {
              // Map index to nav translation key
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
                  className="rounded-lg px-[13px] py-2 text-sm font-medium text-muted transition-colors hover:bg-ink/[0.045] hover:text-ink"
                >
                  {label}
                </a>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher />
            <a
              href="#contact"
              className="flex h-[36px] items-center gap-2 rounded-lg bg-ink px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#2a2e38]"
            >
              {mounted ? t.nav.contactBtn : 'Contact →'}
            </a>
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <LanguageSwitcher />
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="flex h-[36px] w-[36px] items-center justify-center rounded-lg border border-border bg-card"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
