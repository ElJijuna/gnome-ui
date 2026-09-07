import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { StyleSheet } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { ColorPicker, GNOME_PALETTE } from './ColorPicker';
import { ColorSwatch } from './ColorSwatch';

const wrap = (ui: ReactElement) => render(<GnomeProvider colorScheme="light">{ui}</GnomeProvider>);

describe('ColorSwatch', () => {
  it('names itself with the color value by default', async () => {
    await wrap(<ColorSwatch color="#3584e4" />);

    expect(screen.getByLabelText('#3584e4')).toBeOnTheScreen();
  });

  it('accepts an explicit label', async () => {
    await wrap(<ColorSwatch color="#3584e4" accessibilityLabel="Blue" />);

    expect(screen.getByLabelText('Blue')).toBeOnTheScreen();
  });

  it('reports its color when pressed', async () => {
    const onSelect = jest.fn();
    await wrap(<ColorSwatch color="#3584e4" onSelect={onSelect} />);

    fireEvent.press(screen.getByLabelText('#3584e4'));

    expect(onSelect).toHaveBeenCalledWith('#3584e4');
  });

  it('reports the checked state', async () => {
    await wrap(
      <>
        <ColorSwatch color="#3584e4" accessibilityLabel="Blue" selected />
        <ColorSwatch color="#e01b24" accessibilityLabel="Red" />
      </>,
    );

    expect(screen.getByLabelText('Blue').props.accessibilityState.checked).toBe(true);
    expect(screen.getByLabelText('Red').props.accessibilityState.checked).toBe(false);
  });

  it('swaps the hairline for a white ring when selected', async () => {
    await wrap(
      <>
        <ColorSwatch color="#3584e4" accessibilityLabel="Blue" selected />
        <ColorSwatch color="#e01b24" accessibilityLabel="Red" />
      </>,
    );

    const selected = StyleSheet.flatten(screen.getByLabelText('Blue').props.style);
    const idle = StyleSheet.flatten(screen.getByLabelText('Red').props.style);

    expect(selected.borderColor).toBe('rgba(255, 255, 255, 0.9)');
    expect(selected.borderWidth).toBe(2);
    expect(idle.borderColor).toBe('rgba(0, 0, 0, 0.15)');
    expect(idle.borderWidth).toBe(1);
  });

  it('sizes itself from the size prop', async () => {
    await wrap(
      <>
        <ColorSwatch color="#111111" accessibilityLabel="sm" size="sm" />
        <ColorSwatch color="#222222" accessibilityLabel="md" />
        <ColorSwatch color="#333333" accessibilityLabel="lg" size="lg" />
      </>,
    );

    expect(StyleSheet.flatten(screen.getByLabelText('sm').props.style).width).toBe(22);
    expect(StyleSheet.flatten(screen.getByLabelText('md').props.style).width).toBe(30);
    expect(StyleSheet.flatten(screen.getByLabelText('lg').props.style).width).toBe(38);
  });

  it('does not report a press while disabled', async () => {
    const onSelect = jest.fn();
    await wrap(<ColorSwatch color="#3584e4" onSelect={onSelect} disabled />);

    fireEvent.press(screen.getByLabelText('#3584e4'));

    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('ColorPicker', () => {
  it('renders the whole Adwaita palette by default', async () => {
    await wrap(<ColorPicker />);

    expect(screen.getAllByRole('radio')).toHaveLength(GNOME_PALETTE.length);
    expect(screen.getByLabelText('Blue')).toBeOnTheScreen();
    expect(screen.getByLabelText('Slate')).toBeOnTheScreen();
  });

  it('accepts a custom palette', async () => {
    await wrap(<ColorPicker colors={[{ value: '#ff0000', label: 'Red' }]} />);

    expect(screen.getAllByRole('radio')).toHaveLength(1);
  });

  it('groups the swatches without swallowing them', async () => {
    await wrap(<ColorPicker testID="picker" />);
    const group = screen.getByTestId('picker');

    expect(group.props.accessibilityRole).toBe('radiogroup');
    expect(group.props.accessibilityLabel).toBe('Color');
    expect(group.props.accessible).toBeFalsy();
  });

  it('marks the matching swatch as selected', async () => {
    await wrap(<ColorPicker value="#2ec27e" />);

    expect(screen.getByLabelText('Green').props.accessibilityState.checked).toBe(true);
    expect(screen.getByLabelText('Blue').props.accessibilityState.checked).toBe(false);
  });

  it('reports the chosen color', async () => {
    const onChange = jest.fn();
    await wrap(<ColorPicker onChange={onChange} />);

    fireEvent.press(screen.getByLabelText('Purple'));

    expect(onChange).toHaveBeenCalledWith('#9141ac');
  });

  describe('allowCustom', () => {
    it('is off by default', async () => {
      await wrap(<ColorPicker />);

      expect(screen.queryByLabelText('Choose custom color')).toBeNull();
    });

    it('adds the + button', async () => {
      await wrap(<ColorPicker allowCustom />);

      expect(screen.getByLabelText('Choose custom color')).toBeOnTheScreen();
    });

    it('asks the app for a picker instead of opening one itself', async () => {
      const onRequestCustom = jest.fn();
      await wrap(<ColorPicker allowCustom onRequestCustom={onRequestCustom} />);

      fireEvent.press(screen.getByLabelText('Choose custom color'));

      expect(onRequestCustom).toHaveBeenCalled();
    });

    it('shows an off-palette value as its own selected swatch', async () => {
      await wrap(<ColorPicker allowCustom value="#abcdef" />);
      const custom = screen.getByLabelText('Custom color');

      expect(custom).toBeOnTheScreen();
      expect(custom.props.accessibilityState.checked).toBe(true);
      expect(screen.getAllByRole('radio')).toHaveLength(GNOME_PALETTE.length + 1);
    });

    it('does not add a custom swatch for a palette value', async () => {
      await wrap(<ColorPicker allowCustom value="#3584e4" />);

      expect(screen.queryByLabelText('Custom color')).toBeNull();
    });

    it('routes the custom swatch to the same request handler', async () => {
      const onRequestCustom = jest.fn();
      await wrap(<ColorPicker allowCustom value="#abcdef" onRequestCustom={onRequestCustom} />);

      fireEvent.press(screen.getByLabelText('Custom color'));

      expect(onRequestCustom).toHaveBeenCalled();
    });
  });

  describe('disabled', () => {
    it('stops selection', async () => {
      const onChange = jest.fn();
      await wrap(<ColorPicker onChange={onChange} disabled />);

      fireEvent.press(screen.getByLabelText('Blue'));

      expect(onChange).not.toHaveBeenCalled();
    });

    it('stops the custom request too', async () => {
      const onRequestCustom = jest.fn();
      await wrap(<ColorPicker allowCustom onRequestCustom={onRequestCustom} disabled />);

      fireEvent.press(screen.getByLabelText('Choose custom color'));

      expect(onRequestCustom).not.toHaveBeenCalled();
    });
  });
});
