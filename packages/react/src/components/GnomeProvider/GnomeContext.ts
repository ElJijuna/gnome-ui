import { createContext, useContext, useMemo } from "react";

export type GnomeDir = "ltr" | "rtl";

export interface GnomeContextValue {
  locale: string | undefined;
  dir: GnomeDir;
  numberFormat: Intl.NumberFormatOptions | undefined;
  dateTimeFormat: Intl.DateTimeFormatOptions | undefined;
}

export const GnomeContext = createContext<GnomeContextValue>({
  locale: undefined,
  dir: "ltr",
  numberFormat: undefined,
  dateTimeFormat: undefined,
});

/** Returns the locale set by the nearest `GnomeProvider`, or `undefined` to use the browser locale. */
export function useLocale(): string | undefined {
  return useContext(GnomeContext).locale;
}

/** Returns the text direction set by the nearest `GnomeProvider`. Defaults to `"ltr"`. */
export function useDir(): GnomeDir {
  return useContext(GnomeContext).dir;
}

/** Returns an `Intl.NumberFormat` configured from `GnomeProvider` defaults plus local overrides. */
export function useNumberFormatter(
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const { locale, numberFormat } = useContext(GnomeContext);

  return useMemo(
    () => new Intl.NumberFormat(locale, { ...numberFormat, ...options }),
    [locale, numberFormat, options],
  );
}

/** Returns an `Intl.DateTimeFormat` configured from `GnomeProvider` defaults plus local overrides. */
export function useDateTimeFormatter(
  options?: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const { locale, dateTimeFormat } = useContext(GnomeContext);

  return useMemo(
    () => new Intl.DateTimeFormat(locale, { ...dateTimeFormat, ...options }),
    [locale, dateTimeFormat, options],
  );
}
