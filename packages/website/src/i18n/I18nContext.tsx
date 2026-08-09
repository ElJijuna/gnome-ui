import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import en from './en.json';
import es from './es.json';

export type Locale = 'en' | 'es';

type Dictionary = Record<string, unknown>;

const dictionaries: Record<Locale, Dictionary> = { en, es };
const STORAGE_KEY = 'gnome-ui-website-locale';

function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (stored === 'en' || stored === 'es') {
    return stored;
  }

  return window.navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
}

function lookup(dictionary: Dictionary, key: string): string | undefined {
  const value = key.split('.').reduce<unknown>((node, segment) => {
    if (node && typeof node === 'object' && segment in node) {
      return (node as Dictionary)[segment];
    }

    return undefined;
  }, dictionary);

  return typeof value === 'string' ? value : undefined;
}

export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(detectInitialLocale);

  const setLocale = (next: Locale) => {
    setLocaleState(next);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  };

  const value = useMemo<I18nContextValue>(() => {
    const dictionary = dictionaries[locale];

    const t: I18nContextValue['t'] = (key, params) => {
      const template = lookup(dictionary, key) ?? lookup(dictionaries.en, key) ?? key;

      if (!params) {
        return template;
      }

      return Object.entries(params).reduce(
        (text, [name, paramValue]) =>
          text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(paramValue)),
        template,
      );
    };

    return { locale, setLocale, t };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }

  return context;
}
