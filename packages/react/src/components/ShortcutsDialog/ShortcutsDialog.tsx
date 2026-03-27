import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import styles from "./ShortcutsDialog.module.css";

// ─── Public types ─────────────────────────────────────────────────────────────

export interface ShortcutEntry {
  /**
   * Key combination tokens, e.g. `["Ctrl", "S"]` or `["F5"]`.
   * Each token is rendered as a styled `<kbd>` key cap.
   */
  keys: string[];
  /** Human-readable description of what the shortcut does. */
  description: string;
}

export interface ShortcutsSection {
  /** Section heading, e.g. "File", "Edit". */
  title: string;
  shortcuts: ShortcutEntry[];
}

export interface ShortcutsDialogProps {
  /** Whether the dialog is visible. */
  open: boolean;
  /** Called when the dialog is dismissed (Escape, close button). */
  onClose: () => void;
  /** Dialog heading. Defaults to `"Keyboard Shortcuts"`. */
  title?: string;
  /** Shortcut sections to display. */
  sections: ShortcutsSection[];
}

// ─── Focusable selector (reused from Dialog) ─────────────────────────────────

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Modal dialog listing keyboard shortcuts, grouped in sections, with
 * integrated search to filter by description or key name.
 *
 * Mirrors `AdwShortcutsDialog` (libadwaita 1.8 / GNOME 49).
 *
 * - Renders into a portal (`document.body`).
 * - Traps focus; Escape closes.
 * - Search filters across all sections in real time.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ShortcutsDialog.html
 */
export function ShortcutsDialog({
  open,
  onClose,
  title = "Keyboard Shortcuts",
  sections,
}: ShortcutsDialogProps) {
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<Element | null>(null);
  const titleId = useRef(`shortcuts-title-${Math.random().toString(36).slice(2, 9)}`);

  // Save / restore focus
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement;
      // Focus the search field after mount
      requestAnimationFrame(() => searchRef.current?.focus());
    } else {
      setQuery("");
      (previouslyFocused.current as HTMLElement | null)?.focus();
    }
  }, [open]);

  // Focus trap + Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  if (!open) return null;

  // Filter sections by query
  const q = query.trim().toLowerCase();
  const filtered = sections
    .map((section) => ({
      ...section,
      shortcuts: section.shortcuts.filter(
        ({ description, keys }) =>
          !q ||
          description.toLowerCase().includes(q) ||
          keys.some((k) => k.toLowerCase().includes(q)),
      ),
    }))
    .filter((s) => s.shortcuts.length > 0);

  const node = (
    <div
      className={styles.backdrop}
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId.current}
        className={styles.dialog}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className={styles.header}>
          <span id={titleId.current} className={styles.title}>
            {title}
          </span>
          <button
            type="button"
            className={styles.closeBtn}
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* ── Search ── */}
        <div className={styles.searchRow}>
          <span className={styles.searchIcon} aria-hidden="true">⌕</span>
          <input
            ref={searchRef}
            type="search"
            className={styles.searchInput}
            placeholder="Search shortcuts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search shortcuts"
          />
          {query && (
            <button
              type="button"
              className={styles.searchClear}
              aria-label="Clear search"
              onClick={() => { setQuery(""); searchRef.current?.focus(); }}
            >
              ×
            </button>
          )}
        </div>

        {/* ── Shortcut list ── */}
        <div className={styles.body} role="list">
          {filtered.length === 0 ? (
            <p className={styles.empty}>No shortcuts match "{query}"</p>
          ) : (
            filtered.map((section) => (
              <section key={section.title} className={styles.section}>
                <h3 className={styles.sectionTitle}>{section.title}</h3>
                <ul className={styles.list}>
                  {section.shortcuts.map((shortcut) => (
                    <li key={shortcut.description} className={styles.row} role="listitem">
                      <span className={styles.keys} aria-label={shortcut.keys.join(" + ")}>
                        {shortcut.keys.map((key, i) => (
                          <span key={i} className={styles.keyCap}>
                            <kbd>{key}</kbd>
                            {i < shortcut.keys.length - 1 && (
                              <span className={styles.plus} aria-hidden="true">+</span>
                            )}
                          </span>
                        ))}
                      </span>
                      <span className={styles.description}>{shortcut.description}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return node;
  return createPortal(node, document.body);
}
