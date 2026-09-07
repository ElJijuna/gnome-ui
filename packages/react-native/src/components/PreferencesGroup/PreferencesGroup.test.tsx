import { render, screen } from '@testing-library/react-native';
import { createRef, type ReactElement } from 'react';
import type { View } from 'react-native';
import { Text as RNText, StyleSheet } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { PreferencesGroup } from './PreferencesGroup';

const wrap = (ui: ReactElement) => render(<GnomeProvider colorScheme="light">{ui}</GnomeProvider>);

const styleOf = (testID: string) => StyleSheet.flatten(screen.getByTestId(testID).props.style);

describe('PreferencesGroup', () => {
  it('renders its children', async () => {
    await wrap(
      <PreferencesGroup title="Appearance">
        <RNText>Row</RNText>
      </PreferencesGroup>,
    );

    expect(screen.getByText('Row')).toBeOnTheScreen();
  });

  describe('header', () => {
    it('renders the title as a heading', async () => {
      await wrap(<PreferencesGroup title="Appearance" />);

      expect(screen.getByRole('header', { name: 'Appearance' })).toBeOnTheScreen();
    });

    it('uses semibold at the body size, not the bolder heading variant', async () => {
      await wrap(<PreferencesGroup title="Appearance" />);
      const style = StyleSheet.flatten(screen.getByText('Appearance').props.style);

      expect(style.fontWeight).toBe('600');
      expect(style.fontSize).toBe(16);
    });

    it('renders the description', async () => {
      await wrap(<PreferencesGroup title="Appearance" description="How the app looks." />);

      expect(screen.getByText('How the app looks.')).toBeOnTheScreen();
    });

    it('renders a header suffix', async () => {
      await wrap(
        <PreferencesGroup title="Appearance" headerSuffix={<RNText>Reset</RNText>}>
          <RNText>Row</RNText>
        </PreferencesGroup>,
      );

      expect(screen.getByText('Reset')).toBeOnTheScreen();
    });

    it('renders a suffix-only header with no title', async () => {
      await wrap(<PreferencesGroup headerSuffix={<RNText>Reset</RNText>} />);

      expect(screen.getByText('Reset')).toBeOnTheScreen();
      expect(screen.queryByRole('header')).toBeNull();
    });

    it('omits the header entirely when there is nothing to put in it', async () => {
      await wrap(
        <PreferencesGroup testID="group">
          <RNText>Row</RNText>
        </PreferencesGroup>,
      );

      // Root → content wrapper only; no header row in between.
      expect(screen.getByTestId('group').children).toHaveLength(1);
    });
  });

  describe('layout', () => {
    it('spaces the header from the content by the standard 12', async () => {
      await wrap(<PreferencesGroup testID="group" title="Appearance" />);

      expect(styleOf('group').gap).toBe(12);
    });

    it('keeps the rows in one wrapper so the gap never lands between them', async () => {
      await wrap(
        <PreferencesGroup testID="group" title="Appearance">
          <RNText>First</RNText>
          <RNText>Second</RNText>
        </PreferencesGroup>,
      );

      // Header + a single content wrapper — not header + two loose rows,
      // which would put a 12 dp gap between the rows themselves.
      expect(screen.getByTestId('group').children).toHaveLength(2);
    });
  });

  it('merges a consumer style over its own', async () => {
    await wrap(<PreferencesGroup testID="group" title="Appearance" style={{ gap: 24 }} />);

    expect(styleOf('group').gap).toBe(24);
  });

  it('forwards a ref to the underlying View', async () => {
    const ref = createRef<View>();
    await wrap(<PreferencesGroup ref={ref} title="Appearance" />);

    expect(ref.current).not.toBeNull();
  });
});
