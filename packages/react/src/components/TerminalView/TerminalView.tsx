import {
  useEffect,
  useRef,
  type HTMLAttributes,
} from "react";
import styles from "./TerminalView.module.css";

export type TerminalVariant = "default" | "success" | "warning" | "destructive";

export interface TerminalViewProps extends HTMLAttributes<HTMLDivElement> {
  /** Lines of text to display. */
  lines: string[];
  /** Colorize text based on semantic meaning. Defaults to `"default"`. */
  variant?: TerminalVariant;
  /** Maximum number of lines to keep in the buffer. Defaults to `500`. */
  maxLines?: number;
  /** Automatically scroll to the latest line when content changes. Defaults to `true`. */
  autoScroll?: boolean;
}

export function TerminalView({
  lines,
  variant = "default",
  maxLines = 500,
  autoScroll = true,
  className,
  ...props
}: TerminalViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const visibleLines = lines.slice(-maxLines);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [visibleLines.length, autoScroll]);

  return (
    <div
      className={[styles.terminal, styles[variant], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <pre className={styles.pre}>
        {visibleLines.map((line, i) => (
          <div key={i} className={styles.line}>
            {line}
          </div>
        ))}
        <div ref={bottomRef} />
      </pre>
    </div>
  );
}
