import { Check, Copy } from '@gnome-ui/icons';
import { type CSSProperties, useEffect, useRef, useState } from 'react';

import { IconButton, type IconButtonProps } from '../IconButton';

export interface CopyButtonProps
  extends Omit<IconButtonProps, 'icon' | 'label' | 'onClick' | 'tooltip'> {
  /** The text copied to the clipboard when the button is activated. */
  value: string;
  /** Accessible label and tooltip shown before copying. Defaults to `"Copy"`. */
  label?: string;
  /** Accessible label and tooltip shown briefly after a successful copy. Defaults to `"Copied!"`. */
  copiedLabel?: string;
  /** How long the "copied" confirmation state is shown, in milliseconds. Defaults to `2000`. */
  resetDelay?: number;
  /**
   * Called after `value` is successfully written to the clipboard.
   * Named `onCopied` (not `onCopy`) to avoid colliding with the native
   * `onCopy` clipboard DOM event already present on button HTML attributes.
   */
  onCopied?: (value: string) => void;
  /** Called if the copy attempt fails, e.g. the Clipboard API is unavailable or permission was denied. */
  onCopyError?: (error: unknown) => void;
}

// Visually hides the live-region announcement without removing it from the
// accessibility tree — standard "sr-only" recipe.
const LIVE_REGION_STYLE: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

/**
 * Icon button that copies `value` to the clipboard, swapping to a checkmark
 * and a "Copied!" tooltip for `resetDelay` ms as confirmation.
 */
export const CopyButton = ({
  value,
  label = 'Copy',
  copiedLabel = 'Copied!',
  resetDelay = 2000,
  onCopied,
  onCopyError,
  ...props
}: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  const handleClick = async () => {
    if (!navigator.clipboard?.writeText) {
      onCopyError?.(new Error('Clipboard API is unavailable in this context.'));

      return;
    }

    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      onCopyError?.(error);

      return;
    }

    onCopied?.(value);
    setCopied(true);

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setCopied(false);
      timeoutRef.current = null;
    }, resetDelay);
  };

  return (
    <>
      <IconButton
        {...props}
        icon={copied ? Check : Copy}
        label={copied ? copiedLabel : label}
        tooltip={copied ? copiedLabel : label}
        onClick={handleClick}
      />
      <span aria-live="polite" role="status" style={LIVE_REGION_STYLE}>
        {copied ? copiedLabel : ''}
      </span>
    </>
  );
};
