import type { HTMLAttributes, ReactNode } from "react";
import { Spacer, Toolbar } from "@gnome-ui/react";
import styles from "./StatusBar.module.css";

export interface StatusBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Leading status content. */
  children?: ReactNode;
  /** Optional trailing status/actions. */
  trailing?: ReactNode;
}

/**
 * Compact footer/status bar for `Layout.footer`.
 */
export function StatusBar({
  children,
  trailing,
  className,
  ...props
}: StatusBarProps) {
  return (
    <Toolbar
      className={[styles.statusBar, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
      {trailing && (
        <>
          <Spacer />
          <div className={styles.trailing}>{trailing}</div>
        </>
      )}
    </Toolbar>
  );
}
