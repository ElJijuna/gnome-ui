import { type GnomeColorScheme, GnomeProvider } from '@gnome-ui/react';
import { createContext, type ReactNode, useContext, useState } from 'react';

const STORAGE_KEY = 'gnome-ui-website-color-scheme';

export interface ThemeContextValue {
  colorScheme: GnomeColorScheme;
  setColorScheme: (scheme: GnomeColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function detectInitialColorScheme(): GnomeColorScheme {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
}

/** Owns the site's color-scheme preference and wraps `GnomeProvider` with it. */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [colorScheme, setColorSchemeState] = useState<GnomeColorScheme>(detectInitialColorScheme);

  const setColorScheme = (next: GnomeColorScheme) => {
    setColorSchemeState(next);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme }}>
      <GnomeProvider colorScheme={colorScheme}>{children}</GnomeProvider>
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useThemePreference(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemePreference must be used within ThemeProvider');
  }

  return context;
}
