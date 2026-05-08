import { useMemo, type ReactNode } from "react";
import { GnomeContext, type GnomeDir } from "./GnomeContext";

export interface GnomeProviderProps {
  /**
   * BCP 47 locale tag (e.g. `"es-ES"`, `"de-DE"`).
   * When omitted, components fall back to the browser locale.
   */
  locale?: string;
  /** Text direction. Defaults to `"ltr"`. */
  dir?: GnomeDir;
  /**
   * Global defaults for number formatting.
   *
   * Use `{ notation: "compact", compactDisplay: "short" }` for compact
   * values such as `1K`; omit it or set `{ notation: "standard" }` for
   * full values such as `1,000`.
   */
  numberFormat?: Intl.NumberFormatOptions;
  /** Global defaults for date/time formatting. */
  dateTimeFormat?: Intl.DateTimeFormatOptions;
  children: ReactNode;
}

/** Provides locale and text direction to all descendant gnome-ui components. */
export function GnomeProvider({
  locale,
  dir = "ltr",
  numberFormat,
  dateTimeFormat,
  children,
}: GnomeProviderProps) {
  const value = useMemo(
    () => ({ locale, dir, numberFormat, dateTimeFormat }),
    [locale, dir, numberFormat, dateTimeFormat],
  );

  return (
    <GnomeContext.Provider value={value}>
      {children}
    </GnomeContext.Provider>
  );
}
