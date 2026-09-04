import {
  type GnomeAccentColor,
  type GnomeColorScheme,
  type GnomeContrast,
  GnomeProvider,
  useGnomeTheme,
  useResolvedColorScheme,
} from '@gnome-ui/react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ComponentScreen } from './src/ComponentScreen';
import { ControlsBar } from './src/ControlsBar';
import { HomeScreen } from './src/HomeScreen';
import type { Screen } from './src/types';

const App = () => {
  const [colorScheme, setColorScheme] = useState<GnomeColorScheme>('system');
  const [contrast, setContrast] = useState<GnomeContrast>('system');
  const [accentColor, setAccentColor] = useState<GnomeAccentColor>('blue');

  return (
    <SafeAreaProvider>
      <GnomeProvider colorScheme={colorScheme} contrast={contrast} accentColor={accentColor}>
        <AppShell
          colorScheme={colorScheme}
          onColorSchemeChange={setColorScheme}
          contrast={contrast}
          onContrastChange={setContrast}
          accentColor={accentColor}
          onAccentColorChange={setAccentColor}
        />
      </GnomeProvider>
    </SafeAreaProvider>
  );
};

export default App;

interface AppShellProps {
  colorScheme: GnomeColorScheme;
  onColorSchemeChange: (value: GnomeColorScheme) => void;
  contrast: GnomeContrast;
  onContrastChange: (value: GnomeContrast) => void;
  accentColor: GnomeAccentColor;
  onAccentColorChange: (value: GnomeAccentColor) => void;
}

/**
 * Everything below `GnomeProvider` — needs to be a separate component so
 * `useGnomeTheme()`/`useResolvedColorScheme()` run inside the provider's
 * context rather than alongside it.
 */
const AppShell = (props: AppShellProps) => {
  const theme = useGnomeTheme();
  const resolvedColorScheme = useResolvedColorScheme();
  const [screen, setScreen] = useState<Screen>('home');

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.windowBgColor }}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style={resolvedColorScheme === 'dark' ? 'light' : 'dark'} />
      <ControlsBar
        colorScheme={props.colorScheme}
        onColorSchemeChange={props.onColorSchemeChange}
        contrast={props.contrast}
        onContrastChange={props.onContrastChange}
        accentColor={props.accentColor}
        onAccentColorChange={props.onAccentColorChange}
      />
      <View style={{ flex: 1 }}>
        {screen === 'home' ? (
          <HomeScreen onSelect={setScreen} />
        ) : (
          <ComponentScreen name={screen} onBack={() => setScreen('home')} />
        )}
      </View>
    </SafeAreaView>
  );
};
