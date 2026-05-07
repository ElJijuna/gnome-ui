import { createContext, useContext } from "react";

export type GnomeDir = "ltr" | "rtl";

export interface GnomeContextValue {
  locale: string | undefined;
  dir: GnomeDir;
}

export const GnomeContext = createContext<GnomeContextValue>({
  locale: undefined,
  dir: "ltr",
});

/** Returns the locale set by the nearest `GnomeProvider`, or `undefined` to use the browser locale. */
export function useLocale(): string | undefined {
  return useContext(GnomeContext).locale;
}

/** Returns the text direction set by the nearest `GnomeProvider`. Defaults to `"ltr"`. */
export function useDir(): GnomeDir {
  return useContext(GnomeContext).dir;
}
