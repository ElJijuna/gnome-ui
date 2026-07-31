import type { HTMLAttributes } from 'react';

import styles from './Highlight.module.css';

export interface HighlightProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Full text to render. */
  text: string;
  /**
   * Term or terms to highlight within `text`. Pass an array to highlight
   * multiple distinct terms at once (e.g. each word of a multi-word search
   * query). Empty or whitespace-only terms are ignored.
   */
  query: string | string[];
  /** Match case-sensitively. Defaults to `false`. */
  caseSensitive?: boolean;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Wraps every occurrence of `query` within `text` in a `<mark>` element.
 *
 * Pairs with `SearchBar`'s suggestion list and any filterable list/table to
 * show users which part of a result matched what they typed.
 */
export const Highlight = ({
  text,
  query,
  caseSensitive = false,
  className,
  ...props
}: HighlightProps) => {
  const terms = (Array.isArray(query) ? query : [query]).map((q) => q.trim()).filter(Boolean);

  if (terms.length === 0) {
    return (
      <span className={className} {...props}>
        {text}
      </span>
    );
  }

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, caseSensitive ? 'g' : 'gi');
  const parts = text.split(pattern);

  return (
    <span className={className} {...props}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className={styles.mark}>
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  );
};
