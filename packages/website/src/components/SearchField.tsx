import { SearchBar, type SearchBarProps } from '@gnome-ui/react';
import type { CSSProperties } from 'react';

import styles from './SearchField.module.css';

export interface SearchFieldProps extends SearchBarProps {
  /** Applied to the field's wrapper, not the `<input>` — layout spacing goes here. */
  wrapperStyle?: CSSProperties;
  wrapperClassName?: string;
}

/**
 * `SearchBar` is designed to sit flush under a `HeaderBar` — its own
 * background/border only make sense there. This wraps it as a standalone,
 * bordered field for use inline in page content instead.
 *
 * `style`/`className` pass straight through to the underlying `<input>`
 * (that's how `SearchBar` is built) — use `wrapperStyle`/`wrapperClassName`
 * to affect the field's own box, e.g. layout spacing.
 */
export const SearchField = ({ wrapperStyle, wrapperClassName, ...props }: SearchFieldProps) => (
  <div className={[styles.wrap, wrapperClassName].filter(Boolean).join(' ')} style={wrapperStyle}>
    <SearchBar inline {...props} />
  </div>
);
