import { useEffect, useMemo, useReducer, type ReactNode } from "react";
import { GnomeContext, type GnomeColorScheme, type GnomeDir } from "./GnomeContext";

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
  /**
   * Color scheme preference. When set to `"system"` (default), the OS
   * preference is respected via `prefers-color-scheme`. When set to
   * `"light"` or `"dark"`, the `data-theme` attribute is applied to
   * `document.documentElement` to force that theme.
   */
  colorScheme?: GnomeColorScheme;
  children: ReactNode;
}

function getSystemIsDark(): boolean {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Provides locale, text direction, and color scheme to all descendant gnome-ui components. */
export function GnomeProvider({
  locale,
  dir = "ltr",
  numberFormat,
  dateTimeFormat,
  colorScheme = "system",
  children,
}: GnomeProviderProps) {
  const [, forceUpdate] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    if (colorScheme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", forceUpdate);
    return () => mq.removeEventListener("change", forceUpdate);
  }, [colorScheme]);

  useEffect(() => {
    const root = document.documentElement;
    if (colorScheme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", colorScheme);
    }
  }, [colorScheme]);

  const resolvedColorScheme = colorScheme === "system"
    ? (getSystemIsDark() ? "dark" : "light")
    : colorScheme;

  const value = useMemo(
    () => ({ locale, dir, numberFormat, dateTimeFormat, colorScheme, resolvedColorScheme }),
    [locale, dir, numberFormat, dateTimeFormat, colorScheme, resolvedColorScheme],
  );

  return (
    <GnomeContext.Provider value={value}>
      {children}
    </GnomeContext.Provider>
  );
}
