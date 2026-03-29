import { useState, type ReactNode } from "react";
import { Icon } from "../Icon";
import { ViewReveal, ViewConceal } from "@gnome-ui/icons";
import { EntryRow, type EntryRowProps } from "../EntryRow";
import styles from "./PasswordEntryRow.module.css";

export interface PasswordEntryRowProps extends Omit<EntryRowProps, "type" | "trailing"> {
  /** Additional trailing widgets placed before the reveal button. */
  trailing?: ReactNode;
}

/**
 * Password entry row with a built-in reveal/conceal toggle.
 *
 * Mirrors `AdwPasswordEntryRow` — an `EntryRow` variant that defaults to
 * `type="password"` and provides a trailing icon button to reveal or conceal
 * the entered text. Use inside a `BoxedList` for password settings fields.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.PasswordEntryRow.html
 */
export function PasswordEntryRow({ trailing, disabled, ...props }: PasswordEntryRowProps) {
  const [revealed, setRevealed] = useState(false);

  const revealButton = (
    <button
      type="button"
      className={styles.revealButton}
      onClick={(e) => {
        e.stopPropagation();
        setRevealed((v) => !v);
      }}
      aria-label={revealed ? "Conceal password" : "Reveal password"}
      aria-pressed={revealed}
      disabled={disabled}
    >
      <Icon
        icon={revealed ? ViewConceal : ViewReveal}
        size={16}
        aria-hidden
      />
    </button>
  );

  return (
    <EntryRow
      {...props}
      type={revealed ? "text" : "password"}
      disabled={disabled}
      trailing={
        <>
          {trailing}
          {revealButton}
        </>
      }
    />
  );
}
