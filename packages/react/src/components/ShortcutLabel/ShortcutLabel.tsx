import type { HTMLAttributes } from 'react';

import styles from './ShortcutLabel.module.css';

export interface ShortcutLabelProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Keyboard shortcut string.
   *
   * Tokens are separated by `+`. Each token is rendered as its own key cap.
   * Common modifiers are normalised to their symbol:
   * - `Ctrl` / `Control` → `⌃`
   * - `Shift` → `⇧`
   * - `Alt` / `Option` → `⌥`
   * - `Super` / `Win` / `Cmd` / `Command` → `⊞`
   * - `Up` → `↑`  `Down` → `↓`  `Left` → `←`  `Right` → `→`
   * - `Enter` / `Return` → `↵`
   * - `Backspace` → `⌫`
   * - `Delete` → `⌦`
   * - `Escape` / `Esc` → `⎋`
   * - `Tab` → `⇥`
   * - `Space` → `␣`
   *
   * Modifiers are always displayed in a fixed order, whatever order they are
   * written in — Hyper, Super, Ctrl, Alt, Shift, Cmd/Meta (⌃ ⌥ ⇧ ⌘ on Apple
   * keyboards) — followed by the remaining keys in their original order.
   * Mirrors `AdwShortcutLabel` (libadwaita 1.10).
   *
   * @example "Ctrl+S"   →  ⌃ S
   * @example "Ctrl+Shift+Z" → ⌃ ⇧ Z
   * @example "Shift+Ctrl+Z" → ⌃ ⇧ Z
   */
  shortcut: string;
  /** When true, modifier tokens are shown as symbols. Defaults to `true`. */
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
 * Display rank of each modifier, following `AdwShortcutLabel`: Hyper, Super,
 * Ctrl, Alt, Shift, then Meta/Cmd — i.e. ⌃ ⌥ ⇧ ⌘, the Apple ordering.
 * Tokens not listed here are regular keys and keep their relative order.
 */
const MODIFIER_RANK: Record<string, number> = {
  hyper: 0,
  super: 1,
  win: 1,
  ctrl: 2,
  control: 2,
  alt: 3,
  option: 3,
  shift: 4,
  cmd: 5,
  command: 5,
  meta: 5,
};

const KEY_RANK = Object.keys(MODIFIER_RANK).length;

/**
 * Read-only display of a keyboard shortcut with per-key key-cap styling.
 *
 * Each token in the `shortcut` string (split by `+`) is rendered as a
 * separate `<kbd>` element. Modifier keys are normalised to their Unicode
 * symbols by default and displayed in a fixed order (⌃ ⌥ ⇧ ⌘).
 *
 * Mirrors `GtkShortcutLabel` / `AdwShortcutLabel`.
 *
 * @see https://docs.gtk.org/gtk4/class.ShortcutLabel.html
 */
export const ShortcutLabel = ({
  shortcut,
  symbols = true,
  className,
  ...props
}: ShortcutLabelProps) => {
  const tokens = shortcut
    .split('+')
    .map((t) => t.trim())
    .filter(Boolean)
    // Stable sort: modifiers move to the front in canonical order, regular
    // keys keep the order they were written in.
    .map((token, index) => ({ token, index, rank: MODIFIER_RANK[token.toLowerCase()] ?? KEY_RANK }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ token }) => token);

  return (
    <span
      className={[styles.label, className].filter(Boolean).join(' ')}
      aria-label={shortcut}
      {...props}
    >
      {tokens.map((token, i) => {
        const display = symbols ? (SYMBOL_MAP[token.toLowerCase()] ?? token) : token;

        return (
          <kbd key={i} className={styles.key}>
            {display}
          </kbd>
        );
      })}
    </span>
  );
};
