import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  /** Content to render into the target container. */
  children: ReactNode;
  /** DOM node to portal into. Defaults to `document.body`. */
  container?: Element | DocumentFragment;
}

/**
 * Reusable `createPortal` wrapper — SSR-safe (renders `children` inline when
 * `document` is unavailable) with optional mount-target support.
 *
 * Extracts the ad-hoc portal logic previously duplicated independently
 * across `Dialog`, `Modal`, `Popover`, `Tooltip`, `BottomSheet`, and other
 * floating-content components, each of which re-implemented the same
 * `typeof document === 'undefined'` check inline.
 */
export const Portal = ({ children, container }: PortalProps) => {
  if (typeof document === 'undefined') {
    return children;
  }

  return createPortal(children, container ?? document.body);
};
