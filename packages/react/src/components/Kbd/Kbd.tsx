import type { HTMLAttributes } from 'react';

import styles from './Kbd.module.css';

export interface KbdProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /**
   * The key name (e.g. `"Enter"`, `"Esc"`, `"A"`, `"Ctrl"`).
   *
   * Common key names are normalised to their Unicode symbol when `symbols`
   * is `true` (the default) — see `symbols` for the full mapping.
   */
  children: string;
  /**
   * Normalise common key names to their Unicode symbol (e.g. `"Enter"` → `↵`).
   * Matches the same mapping used by `ShortcutLabel`. Defaults to `true`.
   */
  symbols?: boolean;
}

const SYMBOL_MAP: Record<string, string> = {
  ctrl: '⌃',
  control: '⌃',
  shift: '⇧',
  alt: '⌥',
  option: '⌥',
  super: '⊞',
  win: '⊞',
  cmd: '⌘',
  command: '⌘',
  meta: '⌘',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  enter: '↵',
  return: '↵',
  backspace: '⌫',
  delete: '⌦',
  escape: '⎋',
  esc: '⎋',
  tab: '⇥',
  space: '␣',
  pageup: '⇞',
  pagedown: '⇟',
  home: '⇱',
  end: '⇲',
};

/**
 * Standalone single key-cap for inline instructional text
 * (e.g. `press <Kbd>Enter</Kbd> to continue`).
 *
 * Complements `ShortcutLabel`, which only renders full `+`-delimited
 * combos (`"Ctrl+S"`) and doesn't expose its per-key styling on its own.
 * Use `Kbd` when referencing a single key outside of a shortcut combo.
 */
export const Kbd = ({ children, symbols = true, className, ...props }: KbdProps) => {
  const display = symbols ? (SYMBOL_MAP[children.toLowerCase()] ?? children) : children;

  return (
    <kbd
      className={[styles.key, className].filter(Boolean).join(' ')}
      aria-label={display !== children ? children : undefined}
      {...props}
    >
      {display}
    </kbd>
  );
};
