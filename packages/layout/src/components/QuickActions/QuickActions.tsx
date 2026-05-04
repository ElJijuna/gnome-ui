import {
  useMemo,
  useRef,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Text } from "@gnome-ui/react";
import styles from "./QuickActions.module.css";

export interface QuickAction {
  id: string;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  onActivate: () => void;
}

export interface QuickActionsProps extends HTMLAttributes<HTMLDivElement> {
  /** Action definitions rendered as shortcut buttons. */
  actions: QuickAction[];
  /** Number of grid columns. Defaults to `4`. */
  columns?: number;
}

function findNextEnabledIndex(
  actions: QuickAction[],
  currentIndex: number,
  direction: 1 | -1,
) {
  if (actions.every((action) => action.disabled)) return currentIndex;

  let nextIndex = currentIndex;
  do {
    nextIndex = (nextIndex + direction + actions.length) % actions.length;
  } while (actions[nextIndex]?.disabled);

  return nextIndex;
}

function findLastEnabledIndex(actions: QuickAction[]) {
  for (let index = actions.length - 1; index >= 0; index -= 1) {
    if (!actions[index]?.disabled) return index;
  }

  return -1;
}

export function QuickActions({
  actions,
  columns = 4,
  className,
  style,
  ...props
}: QuickActionsProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const firstEnabledIndex = useMemo(
    () => actions.findIndex((action) => !action.disabled),
    [actions],
  );

  const focusAction = (index: number) => {
    buttonRefs.current[index]?.focus();
  };

  const handleKeyDown =
    (index: number): ButtonHTMLAttributes<HTMLButtonElement>["onKeyDown"] =>
      (event: KeyboardEvent<HTMLButtonElement>) => {
        if (actions[index]?.disabled) return;

        let nextIndex: number | null = null;

        switch (event.key) {
          case "ArrowRight":
          case "ArrowDown":
            nextIndex = findNextEnabledIndex(actions, index, 1);
            break;
          case "ArrowLeft":
          case "ArrowUp":
            nextIndex = findNextEnabledIndex(actions, index, -1);
            break;
          case "Home":
            nextIndex = firstEnabledIndex;
            break;
          case "End":
            nextIndex = findLastEnabledIndex(actions);
            break;
          default:
            return;
        }

        if (nextIndex !== null && nextIndex >= 0) {
          event.preventDefault();
          focusAction(nextIndex);
        }
      };

  const rootStyle = {
    "--quick-actions-columns": columns,
    ...style,
  } as CSSProperties;

  return (
    <div
      className={[styles.root, className]
        .filter(Boolean)
        .join(" ")}
      style={rootStyle}
      role="group"
      {...props}
    >
      {actions.map((action, index) => (
        <button
          key={action.id}
          ref={(node) => {
            buttonRefs.current[index] = node;
          }}
          type="button"
          className={styles.action}
          disabled={action.disabled}
          tabIndex={index === firstEnabledIndex ? 0 : -1}
          onClick={action.onActivate}
          onKeyDown={handleKeyDown(index)}
        >
          <span aria-hidden="true">{action.icon}</span>
          <Text variant="body">
            {action.label}
          </Text>
        </button>
      ))}
    </div>
  );
}
