import { Text as RNText, type TextStyle } from 'react-native';

import { Text, type TextProps } from '@/components/Text';
import { useGnomeTheme, useResolvedContrast } from '@/GnomeProvider';

export interface HighlightProps extends Omit<TextProps, 'children'> {
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
 * Wraps every occurrence of `query` within `text` in a highlighted inline
 * run — mirrors `@gnome-ui/react`'s `Highlight`, which wraps matches in a
 * `<mark>`. Pairs with `SearchBar`'s suggestion list and any filterable
 * list to show users which part of a result matched what they typed.
 *
 * The outer span is the themed `Text` component (so callers get the same
 * `variant`/`color` API as everywhere else), but each matched run is a
 * plain, unthemed RN `Text` carrying only the highlight's own overrides —
 * RN's `Text` is the one primitive that inherits ambient `fontSize`/
 * `color`/`fontFamily` from a parent `Text` when nested, the same way the
 * web version's `<mark>` inherits from its surrounding text and only
 * overrides `background-color`/`font-weight`. Reaching for the themed
 * `Text` for the marked runs too would reset them to its own default
 * `variant="body"` sizing instead of inheriting whatever variant the
 * caller chose for the whole string.
 *
 * The web version's translucent `color-mix(in srgb, accent 30%,
 * transparent)` background has no RN equivalent (`color-mix` is CSS-only)
 * — resolved to a literal 8-digit `#RRGGBBAA` hex instead, since
 * `accentBgColor` is always a plain 6-digit hex across all four theme
 * variants. `border-radius` on the `<mark>` has no reliable port either:
 * RN only paints `backgroundColor` on an inline (nested) `Text` run, not
 * `borderRadius` — a decorative nicety dropped here, not a behavior gap.
 * `prefers-contrast: more`'s solid-background/white-text swap ports via
 * `useResolvedContrast()`, the same hook `Button` already uses for its own
 * high-contrast branching.
 */
export const Highlight = ({ text, query, caseSensitive = false, ...textProps }: HighlightProps) => {
  const theme = useGnomeTheme();
  const contrast = useResolvedContrast();

  const terms = (Array.isArray(query) ? query : [query]).map((q) => q.trim()).filter(Boolean);

  if (terms.length === 0) {
    return <Text {...textProps}>{text}</Text>;
  }

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, caseSensitive ? 'g' : 'gi');
  const parts = text.split(pattern);

  const markStyle: TextStyle = {
    fontWeight: String(theme.fontWeightSemibold) as TextStyle['fontWeight'],
    ...(contrast === 'more'
      ? { backgroundColor: theme.accentBgColor, color: '#fff' }
      : { backgroundColor: `${theme.accentBgColor}4D` }),
  };

  return (
    <Text {...textProps}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <RNText key={i} style={markStyle}>
            {part}
          </RNText>
        ) : (
          part
        ),
      )}
    </Text>
  );
};
