/**
 * I18n Provider Component
 * 
 * Provides internationalization context to the app
 */

import React, { useState, useEffect } from 'react';
import { I18nContext, getTranslation, getInitialLocale, saveLocale, type Locale } from '@/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale());

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    saveLocale(newLocale);
  };

  const t = (key: string): string => {
    return getTranslation(locale, key);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}
