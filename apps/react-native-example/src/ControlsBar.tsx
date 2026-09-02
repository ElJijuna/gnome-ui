import {
  Button,
  type GnomeAccentColor,
  type GnomeColorScheme,
  type GnomeContrast,
} from '@gnome-ui/react-native';
import { ScrollView, View } from 'react-native';

const ACCENT_COLORS: GnomeAccentColor[] = [
  'blue',
  'green',
  'yellow',
  'orange',
  'red',
  'purple',
  'brown',
];

const COLOR_SCHEMES: GnomeColorScheme[] = ['system', 'light', 'dark'];
const CONTRASTS: GnomeContrast[] = ['system', 'normal', 'more'];

function next<T>(options: T[], current: T): T {
  return options[(options.indexOf(current) + 1) % options.length];
}

export interface ControlsBarProps {
  colorScheme: GnomeColorScheme;
  onColorSchemeChange: (value: GnomeColorScheme) => void;
  contrast: GnomeContrast;
  onContrastChange: (value: GnomeContrast) => void;
  accentColor: GnomeAccentColor;
  onAccentColorChange: (value: GnomeAccentColor) => void;
}

/**
 * Storybook-style "controls" toolbar: cycles the same three knobs
 * `GnomeProvider` exposes (`colorScheme`, `contrast`, `accentColor`) so
 * every demo screen can be checked against all of them without restarting
 * the app. Built entirely from `@gnome-ui/react-native`'s own `Button`,
 * doubling as a live usage example of the library it's showcasing.
 */
export const ControlsBar = (props: ControlsBarProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, padding: 12 }}
    >
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button
          size="sm"
          variant="flat"
          onPress={() => props.onColorSchemeChange(next(COLOR_SCHEMES, props.colorScheme))}
        >
          {`Scheme: ${props.colorScheme}`}
        </Button>
        <Button
          size="sm"
          variant="flat"
          onPress={() => props.onContrastChange(next(CONTRASTS, props.contrast))}
        >
          {`Contrast: ${props.contrast}`}
        </Button>
        <Button
          size="sm"
          variant="flat"
          onPress={() => props.onAccentColorChange(next(ACCENT_COLORS, props.accentColor))}
        >
          {`Accent: ${props.accentColor}`}
        </Button>
      </View>
    </ScrollView>
  );
};
