import { Check, Copy } from '@gnome-ui/icons';
import type ClipboardModule from '@react-native-clipboard/clipboard';
import { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';

import { IconButton, type IconButtonProps } from '@/components/IconButton';

export interface CopyButtonProps
  extends Omit<IconButtonProps, 'icon' | 'label' | 'onPress' | 'tooltip'> {
  /** The text copied to the clipboard when the button is activated. */
  value: string;
  /** Accessible label and tooltip shown before copying. Defaults to `"Copy"`. */
  label?: string;
  /** Accessible label and tooltip shown briefly after a successful copy. Defaults to `"Copied!"`. */
  copiedLabel?: string;
  /** How long the "copied" confirmation state is shown, in milliseconds. Defaults to `2000`. */
  resetDelay?: number;
  /**
   * Called after `value` is written to the clipboard.
   * Named `onCopied` (not `onCopy`), mirroring the web version's own naming.
   */
  onCopied?: (value: string) => void;
  /**
   * Called if the copy attempt throws. Kept for API parity with the web
   * version's `onCopyError` (whose `navigator.clipboard.writeText` can
   * reject, e.g. on permission denial) — but `@react-native-clipboard/
   * clipboard`'s `setString` is a synchronous, void-returning native call
   * with no error channel at all, so in normal operation this won't fire
   * the way it can on web. Kept as a defensive catch around the native
   * call (a real, if unlikely, synchronous throw) rather than removed.
   */
  onCopyError?: (error: unknown) => void;
}

// Visually hides the live-region announcement without removing it from the
// accessibility tree — same 1x1/overflow-hidden recipe as the web version's
// `LIVE_REGION_STYLE`.
const LIVE_REGION_STYLE = {
  position: 'absolute' as const,
  width: 1,
  height: 1,
  overflow: 'hidden' as const,
};

/**
 * Icon button that copies `value` to the clipboard, swapping to a checkmark
 * and a "Copied!" tooltip for `resetDelay` ms as confirmation — mirrors
 * `@gnome-ui/react`'s `CopyButton`.
 *
 * RN has no `navigator.clipboard`, so this is built on
 * `@react-native-clipboard/clipboard` (the community-standard clipboard
 * module, not `expo-clipboard` — chosen so this package works the same in
 * bare RN and Expo, not just this repo's own Expo example app). Its
 * `setString` is synchronous and void — see `onCopyError`'s doc for what
 * that means for error handling.
 *
 * The live-region announcement uses `role="status"` directly (RN's newer
 * `Role` union does include `"status"`, unlike the older
 * `AccessibilityRole` enum `Toast` had to substitute `"alert"` for) plus
 * `accessibilityLiveRegion="polite"` for Android's announcement mechanism.
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

  const handlePress = () => {
    try {
      // Required lazily, not imported at module scope: the native binding's
      // own top-level code calls `TurboModuleRegistry.getEnforcing(...)`
      // eagerly, which throws the instant the module is evaluated if the
      // native side isn't registered — as in Expo Go, which doesn't bundle
      // this community module. A static `import` would throw as soon as
      // this file is loaded, crashing every screen (not just this one),
      // since example apps import every component screen up front. Deferring
      // the require to press-time means Expo Go only fails if this specific
      // button is actually pressed, caught below like any other native error.
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- see comment above
      const Clipboard: typeof ClipboardModule =
        require('@react-native-clipboard/clipboard').default;

      Clipboard.setString(value);
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
        onPress={handlePress}
      />
      <Text role="status" accessibilityLiveRegion="polite" style={LIVE_REGION_STYLE}>
        {copied ? copiedLabel : ''}
      </Text>
    </>
  );
};
