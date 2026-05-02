import type { HTMLAttributes, ReactNode } from "react";
import { Icon, Text } from "@gnome-ui/react";
import { Warning, Lock, Search } from "@gnome-ui/icons";
import styles from "./ErrorState.module.css";

export type ErrorStateType = "generic" | "network" | "permission" | "not-found";

export interface ErrorStateProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Preset type — sets the default icon and title.
   * All defaults can be overridden via `icon` and `title`.
   * Defaults to `"generic"`.
   */
  type?: ErrorStateType;
  /** Overrides the preset icon. */
  icon?: ReactNode;
  /** Overrides the preset title. */
  title?: string;
  /** Optional detail message. */
  description?: string;
  /** Optional recovery action (retry button, back link…). */
  action?: ReactNode;
}

const PRESETS: Record<
  ErrorStateType,
  { icon: ReactNode; title: string }
> = {
  generic: {
    icon: <Icon icon={Warning} size="lg" />,
    title: "Something went wrong",
  },
  network: {
    icon: <Icon icon={Warning} size="lg" />,
    title: "No connection",
  },
  permission: {
    icon: <Icon icon={Lock} size="lg" />,
    title: "Access denied",
  },
  "not-found": {
    icon: <Icon icon={Search} size="lg" />,
    title: "Not found",
  },
};

export function ErrorState({
  type = "generic",
  icon,
  title,
  description,
  action,
  className,
  ...props
}: ErrorStateProps) {
  const preset = PRESETS[type];
  const resolvedIcon = icon ?? preset.icon;
  const resolvedTitle = title ?? preset.title;

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      {...props}
    >
      <div className={[styles.icon, styles[type]].join(" ")} aria-hidden="true">
        {resolvedIcon}
      </div>
      <Text variant="heading" className={styles.title}>
        {resolvedTitle}
      </Text>
      {description && (
        <Text variant="body" color="dim" className={styles.description}>
          {description}
        </Text>
      )}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
