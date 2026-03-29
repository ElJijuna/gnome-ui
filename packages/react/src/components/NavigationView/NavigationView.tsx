import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type HTMLAttributes,
} from "react";
import styles from "./NavigationView.module.css";

// ─── Context ─────────────────────────────────────────────────────────────────

interface NavigationContextValue {
  /** Navigate to a page by its `tag`. Pushes onto the stack. */
  navigate: (tag: string) => void;
  /** Go back one page. No-op if already at the root. */
  pop: () => void;
  /** `true` when there is at least one page to go back to. */
  canGoBack: boolean;
  /** Tag of the currently visible page. */
  currentTag: string;
  /** Direction of the last transition (`"forward"` or `"back"`). */
  direction: "forward" | "back";
}

const NavigationContext = createContext<NavigationContextValue>({
  navigate: () => { },
  pop: () => { },
  canGoBack: false,
  currentTag: "",
  direction: "forward",
});

/** Access the nearest `NavigationView`'s navigation functions. */
export function useNavigation() {
  return useContext(NavigationContext);
}

// ─── NavigationPage ───────────────────────────────────────────────────────────

export interface NavigationPageProps extends HTMLAttributes<HTMLDivElement> {
  /** Unique identifier used with `navigate()`. */
  tag: string;
  /** Page heading shown in a `HeaderBar`-style title bar. */
  title: string;
  children?: ReactNode;
}

/**
 * A single page inside a `NavigationView`.
 * Only visible when its `tag` matches the current page in the stack.
 */
export function NavigationPage({
  tag,
  title,
  children,
  className,
  ...props
}: NavigationPageProps) {
  const { currentTag, direction } = useContext(NavigationContext);
  if (currentTag !== tag) return null;

  return (
    <div
      className={[
        styles.page,
        direction === "forward" ? styles.enterForward : styles.enterBack,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <div className={styles.pageHeader}>
        <span className={styles.pageTitle}>{title}</span>
      </div>
      <div className={styles.pageContent}>{children}</div>
    </div>
  );
}

// ─── NavigationView ───────────────────────────────────────────────────────────

export interface NavigationViewProps extends HTMLAttributes<HTMLDivElement> {
  /** Tag of the first page to show. */
  initialPage: string;
  children?: ReactNode;
}

/**
 * Single-pane push/pop navigation stack.
 *
 * Mirrors `AdwNavigationView` — the mobile-first counterpart to
 * `NavigationSplitView`. Each "screen" is a `NavigationPage` with a unique
 * `tag`. Use `useNavigation()` inside pages to call `navigate(tag)` and `pop()`.
 *
 * @example
 * ```tsx
 * <NavigationView initialPage="home">
 *   <NavigationPage tag="home" title="Home">
 *     <Button onClick={() => navigate("details")}>Open</Button>
 *   </NavigationPage>
 *   <NavigationPage tag="details" title="Details">
 *     <Button onClick={pop}>Back</Button>
 *   </NavigationPage>
 * </NavigationView>
 * ```
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.NavigationView.html
 */
export function NavigationView({
  initialPage,
  children,
  className,
  ...props
}: NavigationViewProps) {
  const [stack, setStack] = useState<string[]>([initialPage]);

  const currentTag = stack[stack.length - 1];
  const canGoBack = stack.length > 1;
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const navigate = (tag: string) => {
    setDirection("forward");
    setStack((s) => [...s, tag]);
  };

  const pop = () => {
    if (stack.length <= 1) return;
    setDirection("back");
    setStack((s) => s.slice(0, -1));
  };

  return (
    <NavigationContext.Provider value={{ navigate, pop, canGoBack, currentTag, direction }}>
      <div
        className={[styles.view, className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </div>
    </NavigationContext.Provider>
  );
}
