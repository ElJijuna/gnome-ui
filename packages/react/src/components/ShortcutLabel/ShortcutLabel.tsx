import type { HTMLAttributes } from "react";
import styles from "./ShortcutLabel.module.css";

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
   * @example "Ctrl+S"   →  ⌃ S
   * @example "Ctrl+Shift+Z" → ⌃ ⇧ Z
   */
  shortcut: string;
  /** When true, modifier tokens are shown as symbols. Defaults to `true`. */
  symbols?: boolean;
}

const SYMBOL_MAP: Record<string, string> = {
  ctrl:      "⌃",
  control:   "⌃",
  shift:     "⇧",
  alt:       "⌥",
  option:    "⌥",
  super:     "⊞",
  win:       "⊞",
  cmd:       "⌘",
  command:   "⌘",
  meta:      "⌘",
  up:        "↑",
  down:      "↓",
  left:      "←",
  right:     "→",
  enter:     "↵",
  return:    "↵",
  backspace: "⌫",
  delete:    "⌦",
  escape:    "⎋",
  esc:       "⎋",
  tab:       "⇥",
  space:     "␣",
  pageup:    "⇞",
  pagedown:  "⇟",
  home:      "⇱",
  end:       "⇲",
};

/**
 * Read-only display of a keyboard shortcut with per-key key-cap styling.
 *
 * Each token in the `shortcut` string (split by `+`) is rendered as a
 * separate `<kbd>` element. Modifier keys are normalised to their Unicode
 * symbols by default.
 *
 * Mirrors `GtkShortcutLabel`.
 *
 * @see https://docs.gtk.org/gtk4/class.ShortcutLabel.html
 */
export function ShortcutLabel({ shortcut, symbols = true, className, ...props }: ShortcutLabelProps) {
  const tokens = shortcut.split("+").map((t) => t.trim()).filter(Boolean);

  return (
    <span
      className={[styles.label, className].filter(Boolean).join(" ")}
      aria-label={shortcut}
      {...props}
    >
      {tokens.map((token, i) => {
        const display = symbols
          ? (SYMBOL_MAP[token.toLowerCase()] ?? token)
          : token;

        return (
          <kbd key={i} className={styles.key}>
            {display}
          </kbd>
        );
      })}
    </span>
  );
}
