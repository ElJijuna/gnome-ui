import { forwardRef, type ReactNode, useEffect, useImperativeHandle, useRef } from 'react';
import type { StyleProp, TextInput, TextInputProps, TextStyle, ViewStyle } from 'react-native';
import { Pressable, Text as RNText, TextInput as RNTextInput, View as RNView } from 'react-native';

import { useGnomeTheme } from '@/GnomeProvider';

export interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  /** Whether the search bar is rendered. `false` renders nothing. */
  open: boolean;
  /**
   * Renders a trailing "Cancel" button (the RN-idiomatic stand-in for the
   * web version's Escape-to-close — touch keyboards have no reliable
   * Escape key) and calls this when it's pressed.
   */
  onClose?: () => void;
  /** Called when the clear (×) button is pressed. Also clears the input value. */
  onClear?: () => void;
  /**
   * Content rendered below the bar (e.g. filter chips). Only rendered
   * while `open` is true.
   */
  children?: ReactNode;
  /** Removes the header-bar background so the bar blends into any surface. */
  inline?: boolean;
  /** Accessible label for the close button. Defaults to `"Cancel"`. */
  closeLabel?: string;
  /** Style applied to the wrapping `View`. */
  style?: StyleProp<ViewStyle>;
  /** Style applied to the `TextInput` itself. */
  inputStyle?: StyleProp<TextStyle>;
}

/**
 * Multiplies an `rgba(r, g, b, a)` token's alpha channel. Duplicated from
 * `TextField` rather than shared — see that component for the full
 * rationale; it's small and self-contained enough that a shared module
 * isn't worth it for two call sites.
 */
function dimColor(color: string, factor: number): string {
  const match = color.match(/^rgba?\(([^,]+),([^,]+),([^,]+),?([^)]+)?\)$/);

  if (!match) {
    return color;
  }

  const [, r, g, b, a] = match;
  const alpha = (a ? Number.parseFloat(a) : 1) * factor;

  return `rgba(${r.trim()}, ${g.trim()}, ${b.trim()}, ${alpha})`;
}

/**
 * Collapsible search input following the Adwaita `AdwSearchBar` pattern.
 *
 * Rebuilt on RN's `TextInput` rather than ported from `@gnome-ui/react`'s
 * `<input type="search">`: `open` no longer drives a CSS height/opacity
 * transition (no established animated-height pattern exists yet in this
 * package — same trade-off `SidebarSection` made for its collapsible body)
 * — `open={false}` renders nothing at all, and mounting on `open={true}`
 * auto-focuses the input, standing in for the web version's
 * `requestAnimationFrame`-on-open focus effect.
 *
 * Dropped relative to `@gnome-ui/react`'s `SearchBar`: the `suggestions` /
 * `onSuggestionSelect` / `loadingSuggestions` / `renderSuggestion` /
 * `suggestionsLabel` autocomplete popover — it depends on a portal +
 * viewport-anchored positioning primitive (`createPortal` +
 * `getBoundingClientRect`) this package doesn't have yet, the same gap
 * that dropped `SidebarItem`'s `menuItems` context menu — and a `Spinner`
 * component, not yet ported. The search/clear icons are Unicode glyphs
 * (`🔍`/`×`) rather than `@gnome-ui/icons`, matching every other
 * no-SVG-dependency component in this package.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.SearchBar.html
 */
export const SearchBar = forwardRef<TextInput, SearchBarProps>(function SearchBar(
  {
    open,
    onClose,
    onClear,
    children,
    value,
    placeholder = 'Search…',
    editable = true,
    inline = false,
    closeLabel = 'Cancel',
    style,
    inputStyle,
    ...inputProps
  },
  ref,
) {
  const theme = useGnomeTheme();
  const inputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => inputRef.current as TextInput, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const id = requestAnimationFrame(() => inputRef.current?.focus());

    return () => cancelAnimationFrame(id);
  }, [open]);

  if (!open) {
    return null;
  }

  const disabled = !editable;
  const hasValue = typeof value === 'string' && value.length > 0;

  const barBg = inline ? 'transparent' : theme.headerbarBgColor;
  const barBorder = inline ? 'transparent' : theme.headerbarShadeColor;

  return (
    <RNView style={style}>
      <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space1 }}>
        <RNView
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.space1,
            paddingVertical: theme.space1,
            paddingHorizontal: theme.space2,
            backgroundColor: barBg,
            borderBottomWidth: 1,
            borderBottomColor: barBorder,
            opacity: disabled ? theme.opacityDisabled : 1,
          }}
        >
          <RNText
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={{ opacity: theme.opacityDim, fontSize: theme.fontSizeBody }}
          >
            {'🔍'}
          </RNText>

          <RNTextInput
            ref={inputRef}
            editable={editable}
            value={value}
            placeholder={placeholder}
            placeholderTextColor={dimColor(theme.windowFgColor, theme.opacityDim)}
            style={[
              {
                flex: 1,
                padding: 0,
                fontFamily: theme.fontFamily,
                fontSize: theme.fontSizeBody,
                lineHeight: Math.round(theme.fontSizeBody * theme.lineHeightBody),
                color: theme.windowFgColor,
              } satisfies TextStyle,
              inputStyle,
            ]}
            {...inputProps}
          />

          {hasValue && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              disabled={disabled}
              hitSlop={8}
              onPress={() => {
                onClear?.();
                inputRef.current?.focus();
              }}
              style={({ pressed }) => ({
                width: 24,
                height: 24,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.radiusSm,
                opacity: disabled ? theme.opacityDisabled : 1,
                backgroundColor: pressed ? theme.activeOverlay : 'transparent',
              })}
            >
              <RNText style={{ fontSize: theme.fontSizeBody, color: theme.windowFgColor }}>
                {'×'}
              </RNText>
            </Pressable>
          )}
        </RNView>

        {onClose && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={closeLabel}
            onPress={onClose}
            hitSlop={8}
          >
            <RNText
              style={{
                fontFamily: theme.fontFamily,
                fontSize: theme.fontSizeBody,
                color: theme.accentColor,
              }}
            >
              {closeLabel}
            </RNText>
          </Pressable>
        )}
      </RNView>

      {children && (
        <RNView
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.space1,
            padding: theme.space1,
            paddingHorizontal: theme.space2,
            backgroundColor: barBg,
            borderBottomWidth: 1,
            borderBottomColor: barBorder,
          }}
        >
          {children}
        </RNView>
      )}
    </RNView>
  );
});
