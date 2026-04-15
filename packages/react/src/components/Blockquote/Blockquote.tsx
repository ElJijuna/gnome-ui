import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Blockquote.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BlockquoteVariant = "default" | "info" | "warning" | "error" | "success";

export interface BlockquoteProps extends HTMLAttributes<HTMLQuoteElement> {
  /**
   * Visual emphasis style.
   * - `"default"` — neutral left border; use for general quotations.
   * - `"info"`    — accent blue; use for tips and noteworthy passages.
   * - `"warning"` — yellow; use for cautionary content.
   * - `"error"`   — red; use for critical or deprecated content.
   * - `"success"` — green; use for positive or approved content.
   */
  variant?: BlockquoteVariant;
  /**
   * Optional icon displayed to the left of the quoted text.
   * Typically a 16 px `<Icon>` component.
   */
  icon?: ReactNode;
  /**
   * Attribution rendered below the quote — author name, source title, etc.
   * Rendered inside a `<footer><cite>` for semantic correctness.
   */
  cite?: ReactNode;
  /** The quoted content. */
  children: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Styled pull-quote with semantic `<blockquote>` markup.
 *
 * Supports five visual variants and optional icon + attribution.
 *
 * ```tsx
 * <Blockquote variant="info" cite="Ada Lovelace, 1842">
 *   The Analytical Engine has no pretensions to originate anything.
 * </Blockquote>
 *
 * <Blockquote variant="warning" icon={<Icon icon={Warning} size={16} />}>
 *   This API is deprecated and will be removed in v3.
 * </Blockquote>
 * ```
 */
export function Blockquote({
  variant = "default",
  icon,
  cite,
  children,
  className,
  ...props
}: BlockquoteProps) {
  return (
    <blockquote
      className={[styles.blockquote, styles[variant], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <div className={styles.body}>
        {icon && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )}
        <p className={styles.content}>{children}</p>
      </div>

      {cite !== undefined && (
        <footer className={styles.footer}>
          <cite className={styles.cite}>{cite}</cite>
        </footer>
      )}
    </blockquote>
  );
}
