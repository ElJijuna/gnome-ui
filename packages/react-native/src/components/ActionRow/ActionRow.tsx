import { forwardRef, type ReactNode } from 'react';
import type { PressableProps, StyleProp, View, ViewStyle } from 'react-native';
import { Pressable, View as RNView, StyleSheet } from 'react-native';

import { Text } from '@/components/Text';
import { useGnomeTheme } from '@/GnomeProvider';

export type ActionRowVariant = 'default' | 'property';

export interface ActionRowProps extends Omit<PressableProps, 'children' | 'style'> {
  /** Primary label. */
  title: string;
  /** Secondary line below the title. */
  subtitle?: string;
  /** Icon or image placed at the leading edge. Rendered as-is — size/color it yourself. */
  leading?: ReactNode;
  /**
   * Widget placed at the trailing edge (`Switch`, `Button`, `Text`…).
   * For interactive end widgets prefer a controlled component and stop
   * event propagation inside it so the row's own `onPress` isn't triggered.
   */
  trailing?: ReactNode;
  /**
   * When true the entire row becomes pressable (renders as `Pressable`
   * with `accessibilityRole="button"`). Use for rows that navigate or
   * trigger an action.
   */
  interactive?: boolean;
  /**
   * `"property"` flips the visual hierarchy: the subtitle becomes the
   * prominent value and the title shrinks to a dim label above it.
   * Use for read-only property display (e.g. "OS Version / GNOME 50").
   * Mirrors the `.property` style class.
   */
  variant?: ActionRowVariant;
  style?: StyleProp<ViewStyle>;
}

/**
 * Standard settings row with title, optional subtitle, and end widget.
 *
 * Mirrors the Adwaita `AdwActionRow` pattern — the fundamental building
 * block inside a `BoxedList`.
 *
 * Rebuilt with `Pressable`/`View`/`Text` rather than ported from
 * `@gnome-ui/react`'s `<button>`/`<div>` — same `interactive` split as
 * `Card`: a pressed-state overlay tinted by `theme.activeOverlay` stands in
 * for the web's `:hover`/`:active` `background-color` transitions, since RN
 * has no hover state on touch devices and no `color-mix()`. `title`/
 * `subtitle` reuse the library's own `Text` component (`variant="body"`/
 * `"caption"`, `color="dim"`) instead of hand-rolled styles, with
 * `numberOfLines={1}` standing in for the web's CSS
 * `text-overflow: ellipsis` truncation.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ActionRow.html
 * @see https://developer.gnome.org/hig/patterns/containers.html
 */
export const ActionRow = forwardRef<View, ActionRowProps>(function ActionRow(
  {
    title,
    subtitle,
    leading,
    trailing,
    interactive = false,
    variant = 'default',
    style,
    disabled,
    ...pressableProps
  },
  ref,
) {
  const theme = useGnomeTheme();
  const property = variant === 'property';

  const baseStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space2,
    paddingVertical: theme.space2,
    paddingHorizontal: theme.space4,
    minHeight: 52,
    width: '100%',
  };

  const content = (
    <>
      {leading && <RNView style={{ flexShrink: 0 }}>{leading}</RNView>}

      <RNView style={{ flex: 1, gap: 2 }}>
        <Text
          variant={property ? 'caption' : 'body'}
          color={property ? 'dim' : 'default'}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            variant={property ? 'body' : 'caption'}
            color={property ? 'default' : 'dim'}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {subtitle}
          </Text>
        )}
      </RNView>

      {trailing && (
        <RNView
          style={{ flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: theme.space1 }}
        >
          {trailing}
        </RNView>
      )}
    </>
  );

  if (!interactive) {
    return (
      <RNView ref={ref} style={[baseStyle, style]} {...pressableProps}>
        {content}
      </RNView>
    );
  }

  return (
    <Pressable
      ref={ref}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={[
        baseStyle,
        { position: 'relative', opacity: disabled ? theme.opacityDisabled : 1 },
        style,
      ]}
      {...pressableProps}
    >
      {({ pressed }) => (
        <>
          {content}
          {pressed && !disabled ? (
            <RNView
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, { backgroundColor: theme.activeOverlay }]}
            />
          ) : null}
        </>
      )}
    </Pressable>
  );
});
