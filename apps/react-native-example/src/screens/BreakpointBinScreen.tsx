import {
  ActionRow,
  BoxedList,
  BreakpointBin,
  Button,
  Switch,
  Text,
  useGnomeTheme,
} from '@gnome-ui/react-native';
import { type ReactNode, useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

/** Tinted, bordered box standing in for "the available width" given to a container. */
const Box = ({ width, children }: { width: number; children: ReactNode }) => {
  const theme = useGnomeTheme();

  return (
    <View
      style={{
        width,
        backgroundColor: theme.cardShadeColor,
        borderColor: theme.borderSubtle,
        borderWidth: 1,
        borderRadius: theme.radiusMd,
        padding: 12,
      }}
    >
      {children}
    </View>
  );
};

export const BreakpointBinScreen = () => {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [wide, setWide] = useState(false);

  return (
    <>
      <Section
        title="Own width, not the window"
        description="Two boxes, same breakpoints — each reacts to its own width, not the phone's"
      >
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Box width={140}>
            <BreakpointBin breakpoints={[{ name: 'compact', maxWidth: 200 }]}>
              {({ activeBreakpoint, width }) => (
                <View style={{ gap: 2 }}>
                  <Text variant="caption" color="dim">
                    {Math.round(width)} dp
                  </Text>
                  <Text variant="body">
                    {activeBreakpoint === 'compact' ? '📦 compact' : '📐 regular'}
                  </Text>
                </View>
              )}
            </BreakpointBin>
          </Box>
          <Box width={260}>
            <BreakpointBin breakpoints={[{ name: 'compact', maxWidth: 200 }]}>
              {({ activeBreakpoint, width }) => (
                <View style={{ gap: 2 }}>
                  <Text variant="caption" color="dim">
                    {Math.round(width)} dp
                  </Text>
                  <Text variant="body">
                    {activeBreakpoint === 'compact' ? '📦 compact' : '📐 regular'}
                  </Text>
                </View>
              )}
            </BreakpointBin>
          </Box>
        </View>
      </Section>

      <Section
        title="No active breakpoint"
        description="Wider than every threshold — activeBreakpoint is null"
      >
        <Box width={320}>
          <BreakpointBin breakpoints={[{ name: 'compact', maxWidth: 200 }]}>
            {({ activeBreakpoint, width }) => (
              <Text variant="body">
                {Math.round(width)} dp — {activeBreakpoint ?? 'none (wider than all thresholds)'}
              </Text>
            )}
          </BreakpointBin>
        </Box>
      </Section>

      <Section
        title="Re-evaluates on resize"
        description="Same box, same BreakpointBin — press the button to grow it past the threshold"
      >
        <View style={{ gap: 12 }}>
          <Box width={wide ? 320 : 160}>
            <BreakpointBin breakpoints={[{ name: 'compact', maxWidth: 200 }]}>
              {({ activeBreakpoint }) => (
                <BoxedList>
                  <ActionRow
                    title="Wi-Fi"
                    trailing={
                      <Switch value={wifi} onValueChange={setWifi} accessibilityLabel="Wi-Fi" />
                    }
                  />
                  {activeBreakpoint !== 'compact' && (
                    <ActionRow
                      title="Bluetooth"
                      trailing={
                        <Switch
                          value={bluetooth}
                          onValueChange={setBluetooth}
                          accessibilityLabel="Bluetooth"
                        />
                      }
                    />
                  )}
                  <Text variant="caption" color="dim">
                    {activeBreakpoint === 'compact'
                      ? 'compact — 1 row shown'
                      : 'regular — both rows shown'}
                  </Text>
                </BoxedList>
              )}
            </BreakpointBin>
          </Box>
          <Button variant="flat" onPress={() => setWide((v) => !v)}>
            {wide ? 'Shrink to 160 dp' : 'Grow to 320 dp'}
          </Button>
        </View>
      </Section>
    </>
  );
};
