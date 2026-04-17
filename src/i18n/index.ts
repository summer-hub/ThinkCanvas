/**
 * Internationalization (i18n)
 * 
 * Simple i18n implementation with React Context
 */

import { createContext, useContext } from 'react';
import { en, type TranslationKeys } from './locales/en';
import { zh } from './locales/zh';

export type Locale = 'en' | 'zh';

const translations: Record<Locale, TranslationKeys> = {
  en,
  zh,
};

// Get nested value from object using dot notation
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}

export interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

export const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key: string) => key,
});

export function useI18n() {
  return useContext(I18nContext);
}

export function getTranslation(locale: Locale, key: string): string {
  const translation = translations[locale];
  return getNestedValue(translation, key);
}

// Get locale from localStorage or browser
export function getInitialLocale(): Locale {
  // Check localStorage first
  const stored = localStorage.getItem('locale');
  if (stored === 'en' || stored === 'zh') {
    return stored;
  }

  // Check browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('zh')) {
    return 'zh';
  }

  return 'en';
}

// Save locale to localStorage
export function saveLocale(locale: Locale): void {
  localStorage.setItem('locale', locale);
}
