/**
 * Language Switcher Component
 * 
 * Allows users to switch between languages
 */

import React from 'react';
import { useI18n, type Locale } from '@/i18n';

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  const languages: Array<{ code: Locale; name: string; flag: string }> = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  return (
    <div className="relative group">
      <button
        className="px-3 py-1.5 text-sm border border-canvas-border hover:border-canvas-accent text-canvas-text rounded-lg transition-colors flex items-center gap-2"
        title="Change Language"
      >
        <span>{languages.find(l => l.code === locale)?.flag}</span>
        <span>{languages.find(l => l.code === locale)?.name}</span>
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 mt-1 bg-canvas-node border border-canvas-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[120px]">
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={`w-full px-3 py-2 text-sm text-left hover:bg-canvas-bg transition-colors flex items-center gap-2 ${
              locale === lang.code ? 'bg-canvas-accent text-white' : 'text-canvas-text'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
