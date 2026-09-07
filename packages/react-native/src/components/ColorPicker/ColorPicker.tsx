import { Add } from '@gnome-ui/icons';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, View as RNView } from 'react-native';

import { Icon } from '@/components/Icon';
import { WrapBox } from '@/components/WrapBox';
import { useGnomeTheme, useResolvedColorScheme } from '@/GnomeProvider';

import { ColorSwatch, type ColorSwatchSize, RING_WIDTH, SWATCH_DIAMETER } from './ColorSwatch';

export interface ColorPickerColor {
  /** Color value (hex recommended). */
  value: string;
  /** Human-readable name, used as the swatch's accessible label. */
  label?: string;
}

/** Default Adwaita-named palette (matches the `Avatar` color set). */
// eslint-disable-next-line react-refresh/only-export-components
export const GNOME_PALETTE: ColorPickerColor[] = [
  { value: '#3584e4', label: 'Blue' },
  { value: '#2ec27e', label: 'Green' },
  { value: '#f6d32d', label: 'Yellow' },
  { value: '#ff7800', label: 'Orange' },
  { value: '#e01b24', label: 'Red' },
  { value: '#9141ac', label: 'Purple' },
  { value: '#986a44', label: 'Brown' },
  { value: '#2190a4', label: 'Teal' },
  { value: '#5e5c64', label: 'Slate' },
];

export interface ColorPickerProps {
  /** Currently selected color value. */
  value?: string;
  /** Called when the user selects a color. */
  onChange?: (value: string) => void;
  /** Palette to display. Defaults to `GNOME_PALETTE` (the 9 Adwaita colors). */
  colors?: ColorPickerColor[];
  /**
   * Show a "+" button after the palette, and render any `value` outside the
   * palette as its own selected swatch. Pressing either calls
   * `onRequestCustom` — RN has no `<input type="color">`, so the picker UI
   * itself is the consuming app's to provide. Defaults to `false`.
   */
  allowCustom?: boolean;
  /**
   * Called when the "+" button (or the current custom swatch) is pressed.
   * Open your own color picker here and feed the result back through
   * `value`/`onChange`.
   */
  onRequestCustom?: () => void;
  /** Swatch size. Defaults to `"md"`. */
  size?: ColorSwatchSize;
  /** Accessible name for the group. Defaults to `"Color"`. */
  accessibilityLabel?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Color palette picker following the Adwaita `GtkColorButton` + swatch
 * pattern, mirroring `@gnome-ui/react`'s own `ColorPicker`. Renders a
 * wrapping row of circular `ColorSwatch` items backed by a radio group.
 *
 * **`allowCustom` is the one prop that changes meaning.** On the web it
 * wires a hidden `<input type="color">` and the browser supplies the whole
 * picker UI; RN has no such control, and building an HSV picker would be a
 * component in its own right rather than a detail of this one. So the prop
 * keeps its *visible* behaviour — the "+" button, and a `value` outside the
 * palette shown as its own selected swatch — while the press is handed to
 * `onRequestCustom` for the app to answer with whatever picker it has. Round
 * trips through `value`/`onChange` exactly as before.
 *
 * The container is a `WrapBox` (`display: flex; flex-wrap: wrap; gap: 8`
 * with nothing else in `.picker`), and the "+" button's `border: 1.5px
 * dashed` ports directly — `borderStyle: 'dashed'` is one of the few CSS
 * border tricks RN does support. Its plus glyph comes from `@gnome-ui/icons`
 * rather than the web's hand-drawn path, since `Add` is the same mark and
 * already resolves to the foreground color `.customButton` asks for.
 *
 * As in `ToggleGroup`, the group takes `accessibilityRole="radiogroup"` but
 * deliberately not `accessible`, which on iOS would collapse the swatches
 * into one unreachable element. Arrow-key navigation and the roving
 * `tabIndex` drop, as everywhere else here.
 *
 * @example
 * const [color, setColor] = useState('#3584e4');
 *
 * <ColorPicker value={color} onChange={setColor} />
 *
 * @example
 * // Custom colors, with your own picker behind the "+"
 * <ColorPicker
 *   value={color}
 *   onChange={setColor}
 *   allowCustom
 *   onRequestCustom={() => setPickerOpen(true)}
 * />
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ColorButton.html
 */
export const ColorPicker = ({
  value,
  onChange,
  colors = GNOME_PALETTE,
  allowCustom = false,
  onRequestCustom,
  size = 'md',
  accessibilityLabel = 'Color',
  disabled = false,
  style,
  testID,
}: ColorPickerProps) => {
  const theme = useGnomeTheme();
  const isDark = useResolvedColorScheme() === 'dark';
  const diameter = SWATCH_DIAMETER[size];

  const isCustom = value !== undefined && !colors.some((color) => color.value === value);

  return (
    <WrapBox
      testID={testID}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      childSpacing={8}
      align="center"
      style={style}
    >
      {colors.map((color) => (
        <ColorSwatch
          key={color.value}
          color={color.value}
          size={size}
          selected={color.value === value}
          disabled={disabled}
          onSelect={onChange}
          accessibilityLabel={color.label ?? color.value}
        />
      ))}

      {allowCustom ? (
        <>
          {isCustom && value ? (
            <ColorSwatch
              color={value}
              size={size}
              selected
              disabled={disabled}
              onSelect={onRequestCustom}
              accessibilityLabel="Custom color"
            />
          ) : null}

          {/* Same reserved ring padding as a swatch, so the row stays aligned. */}
          <RNView style={{ padding: RING_WIDTH, alignSelf: 'flex-start' }}>
            <Pressable
              disabled={disabled}
              onPress={onRequestCustom}
              accessibilityRole="button"
              accessibilityLabel="Choose custom color"
              accessibilityState={{ disabled }}
              style={({ pressed }) => ({
                width: diameter,
                height: diameter,
                borderRadius: theme.radiusPill,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : theme.cardShadeColor,
                backgroundColor: pressed && !disabled ? theme.activeOverlay : theme.cardBgColor,
                opacity: disabled ? theme.opacityDisabled : 1,
              })}
            >
              <Icon
                icon={Add}
                width={Math.round(diameter * 0.5)}
                height={Math.round(diameter * 0.5)}
              />
            </Pressable>
          </RNView>
        </>
      ) : null}
    </WrapBox>
  );
};
