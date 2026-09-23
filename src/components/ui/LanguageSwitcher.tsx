'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { cn } from '@/lib/utils';

export default function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, mounted } = useLanguage();

  if (!mounted) {
    // Return placeholder to avoid hydration mismatch
    return <div className={cn("flex h-9 w-[76px] items-center rounded-lg border border-border bg-card", className)} />;
  }

  return (
    <div
      className={cn(
        "relative flex h-9 items-center rounded-lg border border-border bg-card p-0.5 shadow-sm",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-y-0.5 w-[34px] rounded-md bg-ink transition-transform duration-[250ms] ease-out",
          locale === 'vi' ? "translate-x-0.5" : "translate-x-[36px]"
        )}
      />
      <button
        onClick={() => setLocale('vi')}
        className={cn(
          "relative z-10 flex h-full w-[34px] items-center justify-center text-[12px] font-bold transition-colors duration-200",
          locale === 'vi' ? "text-white" : "text-muted hover:text-ink"
        )}
        aria-label="Tiếng Việt"
      >
        VI
      </button>
      <button
        onClick={() => setLocale('en')}
        className={cn(
          "relative z-10 flex h-full w-[34px] items-center justify-center text-[12px] font-bold transition-colors duration-200",
          locale === 'en' ? "text-white" : "text-muted hover:text-ink"
        )}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
