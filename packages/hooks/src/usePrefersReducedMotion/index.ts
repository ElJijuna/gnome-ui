import { useEffect, useState } from 'react';

/**
 * Tracks the OS-level `prefers-reduced-motion` accessibility setting.
 *
 * Returns `false` during SSR and on environments without `matchMedia`.
 * Updates reactively if the user changes the setting while the app is open.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const query = window.matchMedia('(prefers-reduced-motion: reduce)');

    setPrefersReducedMotion(query.matches);

    const handleChange = () => setPrefersReducedMotion(query.matches);

    query.addEventListener?.('change', handleChange);

    return () => query.removeEventListener?.('change', handleChange);
  }, []);

  return prefersReducedMotion;
}
