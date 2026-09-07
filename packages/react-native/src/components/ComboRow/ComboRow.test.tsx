import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { Text as RNText, StyleSheet } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { ComboRow } from './ComboRow';

const wrap = (ui: ReactElement) => render(<GnomeProvider colorScheme="light">{ui}</GnomeProvider>);

const OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch', disabled: true },
];

const trigger = (name = 'Language') => screen.getByLabelText(name);

const open = async (name?: string) => {
  await act(async () => {
    fireEvent.press(trigger(name));
  });
};

describe('ComboRow', () => {
  it('renders the title and subtitle', async () => {
    await wrap(<ComboRow title="Language" subtitle="Used across the app" options={OPTIONS} />);

    expect(screen.getByText('Language')).toBeOnTheScreen();
    expect(screen.getByText('Used across the app')).toBeOnTheScreen();
  });

  it('renders leading content', async () => {
    await wrap(<ComboRow title="Language" options={OPTIONS} leading={<RNText>flag</RNText>} />);

    expect(screen.getByText('flag')).toBeOnTheScreen();
  });

  describe('selection', () => {
    it('shows the placeholder when nothing is selected', async () => {
      await wrap(<ComboRow title="Language" options={OPTIONS} />);

      expect(screen.getByText('—')).toBeOnTheScreen();
    });

    it('accepts a custom placeholder', async () => {
      await wrap(<ComboRow title="Language" options={OPTIONS} placeholder="Pick one" />);

      expect(screen.getByText('Pick one')).toBeOnTheScreen();
    });

    it('shows the selected label for a controlled value', async () => {
      await wrap(<ComboRow title="Language" options={OPTIONS} value="es" />);

      expect(screen.getByText('Español')).toBeOnTheScreen();
    });

    it('shows the default value when uncontrolled', async () => {
      await wrap(<ComboRow title="Language" options={OPTIONS} defaultValue="en" />);

      expect(screen.getByText('English')).toBeOnTheScreen();
    });

    it('reports the chosen value', async () => {
      const onValueChange = jest.fn();
      await wrap(<ComboRow title="Language" options={OPTIONS} onValueChange={onValueChange} />);

      await open();
      await act(async () => {
        fireEvent.press(screen.getByText('Español'));
      });

      expect(onValueChange).toHaveBeenCalledWith('es');
    });

    it('keeps its own selection when uncontrolled', async () => {
      await wrap(<ComboRow title="Language" options={OPTIONS} defaultValue="en" />);

      await open();
      await act(async () => {
        fireEvent.press(screen.getByText('Español'));
      });

      expect(screen.getByText('Español')).toBeOnTheScreen();
    });

    it('never drifts from a controlled value', async () => {
      await wrap(<ComboRow title="Language" options={OPTIONS} value="en" />);

      await open();
      await act(async () => {
        fireEvent.press(screen.getByText('Español'));
      });

      expect(screen.getByText('English')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('names the selector after the title', async () => {
      await wrap(<ComboRow title="Language" options={OPTIONS} />);

      expect(trigger()).toBeOnTheScreen();
    });

    it('accepts an explicit selector name', async () => {
      await wrap(
        <ComboRow title="Language" options={OPTIONS} accessibilityLabel="Display language" />,
      );

      expect(trigger('Display language')).toBeOnTheScreen();
    });
  });

  describe('disabled', () => {
    it('dims the row', async () => {
      await wrap(<ComboRow testID="row" title="Language" options={OPTIONS} disabled />);

      expect(StyleSheet.flatten(screen.getByTestId('row').props.style).opacity).toBe(0.5);
    });

    it('does not open the list', async () => {
      await wrap(<ComboRow title="Language" options={OPTIONS} disabled />);

      await open();

      expect(screen.queryByText('Español')).toBeNull();
    });
  });

  it('inherits ActionRow metrics', async () => {
    await wrap(<ComboRow testID="row" title="Language" options={OPTIONS} />);

    expect(StyleSheet.flatten(screen.getByTestId('row').props.style).minHeight).toBe(52);
  });
});
