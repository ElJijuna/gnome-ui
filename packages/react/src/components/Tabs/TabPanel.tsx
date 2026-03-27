import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Tabs.module.css";

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Must match the `panelId` passed to the corresponding `TabItem`. */
  id: string;
  /** Controls whether this panel is rendered. */
  active?: boolean;
  children?: ReactNode;
}

/**
 * Content panel associated with a `TabItem`.
 * Hidden panels are kept in the DOM but visually hidden.
 */
export function TabPanel({
  id,
  active = false,
  className,
  children,
  ...props
}: TabPanelProps) {
  return (
    <div
      id={id}
      role="tabpanel"
      hidden={!active}
      tabIndex={0}
      className={[styles.panel, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
