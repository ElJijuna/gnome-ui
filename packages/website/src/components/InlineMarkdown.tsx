import { Link } from '@gnome-ui/react';
import type { ReactNode } from 'react';

import styles from './InlineMarkdown.module.css';

// Matches the small subset of inline markdown actually used across the
// monorepo's READMEs: `code`, **bold**, and [text](url) links.
const TOKEN_PATTERN = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(TOKEN_PATTERN).map((part, i) => {
    const key = `${keyPrefix}-${i}`;

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={key} className={styles.code}>
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);

    if (linkMatch) {
      return (
        <Link key={key} href={linkMatch[2]} external>
          {linkMatch[1]}
        </Link>
      );
    }

    return part;
  });
}

export interface InlineMarkdownProps {
  /** Plain text using the `code`, bold, and link subset of inline markdown. */
  text: string;
}

/** Renders README-extracted prose without pulling in a full markdown pipeline. */
export const InlineMarkdown = ({ text }: InlineMarkdownProps) => {
  const paragraphs = text.split(/\n{2,}/).filter(Boolean);

  return (
    <>
      {paragraphs.map((paragraph, i) => (
        <p key={i} className={styles.paragraph}>
          {renderInline(paragraph, `p${i}`)}
        </p>
      ))}
    </>
  );
};
