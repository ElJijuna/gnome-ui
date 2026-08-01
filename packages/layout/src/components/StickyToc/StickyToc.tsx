import type { HTMLAttributes, MouseEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import styles from './StickyToc.module.css';

export interface StickyTocSection {
  /** Must match the `id` of a heading element on the page. */
  id: string;
  /** Link label. */
  label: string;
}

export interface StickyTocProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Sections to link to, in document order. */
  sections: StickyTocSection[];
  /** Heading rendered above the list. Defaults to `"On this page"`. */
  label?: string;
  /** Called whenever the active section changes based on scroll position. */
  onActiveChange?: (id: string) => void;
}

/**
 * Sticky table-of-contents side rail with scroll-spy: the link for the
 * section currently nearest the top of the viewport is highlighted
 * automatically as the user scrolls. For long docs/settings pages.
 *
 * Each `sections[].id` must match the `id` of a real heading element on
 * the page — `StickyToc` observes those elements directly via
 * `IntersectionObserver`, it does not render the headings itself.
 */
export const StickyToc = ({
  sections,
  label = 'On this page',
  onActiveChange,
  className,
  ...props
}: StickyTocProps) => {
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null);
  const visibleIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (sections.length === 0 || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) {
      return;
    }

    const order = sections.map((s) => s.id);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleIdsRef.current.add(entry.target.id);
          } else {
            visibleIdsRef.current.delete(entry.target.id);
          }
        }

        // Among the currently visible sections, the one earliest in
        // document order is treated as active.
        const next = order.find((id) => visibleIdsRef.current.has(id));

        if (next) {
          setActiveId(next);
          onActiveChange?.(next);
        }
      },
      // Treat a section active once it crosses into the top 20% of the
      // viewport, until it scrolls past the bottom 20%.
      { rootMargin: '-20% 0px -80% 0px' },
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sections, onActiveChange]);

  const handleClick = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(id);

    if (!target) {
      return;
    }

    e.preventDefault();
    target.scrollIntoView({ block: 'start' });
    setActiveId(id);
    onActiveChange?.(id);
  };

  return (
    <nav
      aria-label={label}
      className={[styles.toc, className].filter(Boolean).join(' ')}
      {...props}
    >
      <span className={styles.heading}>{label}</span>
      <ul className={styles.list}>
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={activeId === section.id ? 'location' : undefined}
              className={[styles.link, activeId === section.id ? styles.active : null]
                .filter(Boolean)
                .join(' ')}
              onClick={handleClick(section.id)}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
