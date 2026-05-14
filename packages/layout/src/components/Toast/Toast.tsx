import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import styles from "./Toast.module.css";

const portalContainer =
  typeof document !== "undefined" ? document.body : null;

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastType = "default" | "success" | "error" | "warning" | "info";

export interface ToastOptions {
  /** Short message text. Keep it to one line. */
  title: string;
  /** Optional single action button. Clicking it also dismisses the toast. */
  action?: { label: string; onClick: () => void };
  /**
   * Auto-dismiss delay in ms. Pass `0` to disable auto-dismiss.
   * Defaults to `4000`.
   */
  timeout?: number;
  /** Visual style variant. Defaults to `"default"`. */
  type?: ToastType;
  /**
   * Custom id for later programmatic control. Auto-generated when omitted.
   * Queuing the same id twice is a no-op.
   */
  id?: string;
}

export interface ToastContextValue {
  /** Queue a toast and return its id. */
  show: (options: ToastOptions) => string;
  /** Dismiss a specific toast by id, or the current one when omitted. */
  dismiss: (id?: string) => void;
  /** Immediately clear the entire queue. */
  dismissAll: () => void;
}

export interface ToastProviderProps {
  children: ReactNode;
}

// ─── Internal ────────────────────────────────────────────────────────────────
interface ToastEntry {
  id: string;
  title: string;
  type: ToastType;
  timeout: number;
  action?: { label: string; onClick: () => void };
}

const ToastContext = createContext<ToastContextValue | null>(null);

const EXIT_MS = 220;

function genId() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const TYPE_ARIA_LABEL: Record<ToastType, string> = {
  default: "",
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Info",
};

// ─── Toast card ───────────────────────────────────────────────────────────────
interface ToastCardProps {
  entry: ToastEntry;
  exiting: boolean;
  onDismiss: () => void;
}

function ToastCard({ entry, exiting, onDismiss }: ToastCardProps) {
  const handleAction = () => {
    entry.action?.onClick();
    onDismiss();
  };

  return (
    <div
      className={[styles.toast, exiting && styles.exiting].filter(Boolean).join(" ")}
      role={entry.type === "error" ? "alert" : "status"}
      aria-live={entry.type === "error" ? "assertive" : "polite"}
      aria-atomic="true"
    >
      {entry.type !== "default" && (
        <span
          className={[styles.dot, styles[`dot${cap(entry.type)}`]].join(" ")}
          aria-label={TYPE_ARIA_LABEL[entry.type]}
        />
      )}
      <span className={styles.title}>{entry.title}</span>
      {entry.action && (
        <button type="button" className={styles.action} onClick={handleAction}>
          {entry.action.label}
        </button>
      )}
      <button
        type="button"
        className={styles.close}
        aria-label="Dismiss"
        onClick={onDismiss}
      >
        ✕
      </button>
    </div>
  );
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: ToastProviderProps) {
  const [items, setItems] = useState<ToastEntry[]>([]);
  const [exitingId, setExitingId] = useState<string | null>(null);

  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = items[0] ?? null;

  const dismissCurrent = useCallback(() => {
    if (!current) return;
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);

    setExitingId(current.id);
    exitTimerRef.current = setTimeout(() => {
      setExitingId(null);
      setItems((prev) => prev.slice(1));
    }, EXIT_MS);
  }, [current]);

  const dismiss = useCallback(
    (id?: string) => {
      const target = id ?? current?.id;
      if (!target) return;

      if (target === current?.id) {
        dismissCurrent();
      } else {
        // Remove a queued-but-not-yet-shown toast without animation
        setItems((prev) => prev.filter((item) => item.id !== target));
      }
    },
    [current, dismissCurrent],
  );

  const dismissAll = useCallback(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    setExitingId(null);
    setItems([]);
  }, []);

  const show = useCallback((options: ToastOptions): string => {
    const id = options.id ?? genId();
    setItems((prev) => {
      if (prev.some((item) => item.id === id)) return prev;
      return [
        ...prev,
        {
          id,
          title: options.title,
          type: options.type ?? "default",
          timeout: options.timeout ?? 4000,
          action: options.action,
        },
      ];
    });
    return id;
  }, []);

  // Auto-dismiss timer — resets whenever the displayed toast changes
  useEffect(() => {
    if (!current || current.timeout === 0) return;
    autoTimerRef.current = setTimeout(dismissCurrent, current.timeout);
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [current?.id, dismissCurrent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ show, dismiss, dismissAll }}>
      {children}
      {portalContainer &&
        createPortal(
          <div className={styles.container} aria-label="Notifications">
            {current && (
              <ToastCard
                key={current.id}
                entry={current}
                exiting={exitingId === current.id}
                onDismiss={dismissCurrent}
              />
            )}
          </div>,
          portalContainer,
        )}
    </ToastContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
