import { type ReactNode } from "react";
import { GnomeContext, type GnomeDir } from "./GnomeContext";

export interface GnomeProviderProps {
  /**
   * BCP 47 locale tag (e.g. `"es-ES"`, `"de-DE"`).
   * When omitted, components fall back to the browser locale.
   */
  locale?: string;
  /** Text direction. Defaults to `"ltr"`. */
  dir?: GnomeDir;
  children: ReactNode;
}

/** Provides locale and text direction to all descendant gnome-ui components. */
export function GnomeProvider({ locale, dir = "ltr", children }: GnomeProviderProps) {
  return (
    <GnomeContext.Provider value={{ locale, dir }}>
      {children}
    </GnomeContext.Provider>
  );
}
