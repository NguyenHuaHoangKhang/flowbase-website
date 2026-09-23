'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { Locale, Translation } from './types';
import { vi } from './translations/vi';
import { en } from './translations/en';

type LanguageContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
  t: Translation;
  mounted: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('vi');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('flowbase_lang') as Locale | null;
    if (saved === 'vi' || saved === 'en') {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    } else {
      // Default fallback
      document.documentElement.lang = 'vi';
    }
    setMounted(true);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('flowbase_lang', l);
    document.documentElement.lang = l;
  };

  const toggleLocale = () => {
    setLocale(locale === 'vi' ? 'en' : 'vi');
  };

  const t = locale === 'vi' ? vi : en;

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, t, mounted }),
    [locale, t, mounted]
  );

  return (
    <LanguageContext.Provider value={value}>
      {/* 
        Hydration safe wrap: we render children immediately but consumers 
        can check `mounted` to avoid flashing content if needed.
      */}
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
