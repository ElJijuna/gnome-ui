import type { HTMLAttributes } from 'react';

import { CopyButton } from '@/components/CopyButton';

import styles from './CodeBlock.module.css';

export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The code/config content to display. */
  code: string;
  /** Optional filename shown in the header (e.g. `"config.yaml"`). */
  filename?: string;
  /**
   * Optional language label shown in the header (e.g. `"TypeScript"`, `"bash"`).
   * Purely cosmetic — `CodeBlock` does not perform syntax highlighting.
   */
  language?: string;
  /** Show line numbers in a gutter. Defaults to `false`. */
  lineNumbers?: boolean;
  /** Show a trailing `CopyButton` in the header. Defaults to `true`. */
  copyable?: boolean;
  /** Wrap long lines instead of scrolling horizontally. Defaults to `false`. */
  wrap?: boolean;
}

/**
 * Static monospace code/config snippet display with optional line numbers
 * and a trailing `CopyButton`.
 *
 * Distinct from `TerminalView`, which is for live, scrolling terminal
 * output — `CodeBlock` is for a fixed snippet (a config example, a command
 * to run, a code sample in documentation).
 */
export const CodeBlock = ({
  code,
  filename,
  language,
  lineNumbers = false,
  copyable = true,
  wrap = false,
  className,
  ...props
}: CodeBlockProps) => {
  const lines = code.split('\n');
  const hasHeader = filename || language || copyable;

  return (
    <div className={[styles.block, className].filter(Boolean).join(' ')} {...props}>
      {hasHeader && (
        <div className={styles.header}>
          <span className={styles.headerText}>
            {filename && <span className={styles.filename}>{filename}</span>}
            {language && <span className={styles.language}>{language}</span>}
          </span>
          {copyable && (
            <CopyButton value={code} variant="flat" size="sm" className={styles.copyBtn} />
          )}
        </div>
      )}

      <pre className={[styles.pre, wrap ? styles.wrap : null].filter(Boolean).join(' ')}>
        <code className={styles.code}>
          {lines.map((line, i) => (
            <span key={i} className={styles.line}>
              {lineNumbers && <span className={styles.lineNumber}>{i + 1}</span>}
              <span className={styles.lineText}>{line || ' '}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
};
