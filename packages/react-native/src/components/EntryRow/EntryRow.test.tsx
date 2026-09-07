import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { createRef, type ReactElement } from 'react';
import type { TextInput } from 'react-native';
import { Text as RNText, StyleSheet } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { EntryRow } from './EntryRow';

const wrap = (ui: ReactElement) => render(<GnomeProvider colorScheme="light">{ui}</GnomeProvider>);

/** The field is reachable by its accessible name — the `title`. */
const input = (name = 'Display name') => screen.getByLabelText(name);

describe('EntryRow', () => {
  it('renders the title as the visible label', async () => {
    await wrap(<EntryRow title="Display name" />);

    expect(screen.getByText('Display name', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('names the field with the title and hides the duplicate visible label', async () => {
    await wrap(<EntryRow title="Display name" />);

    // RN has no `<label htmlFor>`, so the title is attached as the input's
    // accessible name and the drawn label is excluded from the tree — being
    // findable only with `includeHiddenElements` is the proof.
    expect(screen.getByLabelText('Display name')).toBeOnTheScreen();
    expect(screen.queryByText('Display name')).toBeNull();
  });

  it('lets a consumer override the accessible name', async () => {
    await wrap(<EntryRow title="Display name" accessibilityLabel="Your public handle" />);

    expect(screen.getByLabelText('Your public handle')).toBeOnTheScreen();
  });

  describe('value', () => {
    it('starts empty when uncontrolled with no default', async () => {
      await wrap(<EntryRow title="Display name" />);

      expect(input().props.value).toBe('');
    });

    it('honours defaultValue', async () => {
      await wrap(<EntryRow title="Display name" defaultValue="Ada" />);

      expect(input().props.value).toBe('Ada');
    });

    it('keeps its own state when uncontrolled', async () => {
      await wrap(<EntryRow title="Display name" />);

      await act(async () => {
        fireEvent.changeText(input(), 'Grace');
      });

      expect(input().props.value).toBe('Grace');
    });

    it('never drifts from a controlled value', async () => {
      await wrap(<EntryRow title="Display name" value="Ada" />);

      fireEvent.changeText(input(), 'Grace');

      expect(input().props.value).toBe('Ada');
    });

    it('reports changes through onValueChange', async () => {
      const onValueChange = jest.fn();
      await wrap(<EntryRow title="Display name" onValueChange={onValueChange} />);

      fireEvent.changeText(input(), 'Grace');

      expect(onValueChange).toHaveBeenCalledWith('Grace');
    });

    it('still calls a consumer onChangeText', async () => {
      const onChangeText = jest.fn();
      await wrap(<EntryRow title="Display name" onChangeText={onChangeText} />);

      fireEvent.changeText(input(), 'Grace');

      expect(onChangeText).toHaveBeenCalledWith('Grace');
    });
  });

  describe('floating label', () => {
    // The float itself is an interpolated animation — its rendered output is
    // verified on-device rather than asserted on here. What matters at this
    // level is that the two inputs driving it behave.
    it('survives focus and blur without losing the label or the value', async () => {
      await wrap(<EntryRow title="Display name" defaultValue="Ada" />);

      await act(async () => {
        fireEvent(input(), 'focus');
      });
      await act(async () => {
        fireEvent(input(), 'blur');
      });

      expect(screen.getByText('Display name', { includeHiddenElements: true })).toBeOnTheScreen();
      expect(input().props.value).toBe('Ada');
    });

    it('forwards focus and blur to the consumer', async () => {
      const onFocus = jest.fn();
      const onBlur = jest.fn();
      await wrap(<EntryRow title="Display name" onFocus={onFocus} onBlur={onBlur} />);

      await act(async () => {
        fireEvent(input(), 'focus');
        fireEvent(input(), 'blur');
      });

      expect(onFocus).toHaveBeenCalled();
      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('slots', () => {
    it('renders leading and trailing content', async () => {
      await wrap(
        <EntryRow
          title="API token"
          leading={<RNText>lead</RNText>}
          trailing={<RNText>trail</RNText>}
        />,
      );

      expect(screen.getByText('lead')).toBeOnTheScreen();
      expect(screen.getByText('trail')).toBeOnTheScreen();
    });
  });

  describe('disabled', () => {
    it('makes the input non-editable and dims the row', async () => {
      await wrap(<EntryRow testID="row" title="Display name" disabled />);

      expect(input().props.editable).toBe(false);
      expect(StyleSheet.flatten(screen.getByTestId('row').props.style).opacity).toBe(0.5);
    });
  });

  it('sizes the row to the Adwaita 56 dp minimum', async () => {
    await wrap(<EntryRow testID="row" title="Display name" />);

    expect(StyleSheet.flatten(screen.getByTestId('row').props.style).minHeight).toBe(56);
  });

  it('merges a consumer style over its own', async () => {
    await wrap(<EntryRow testID="row" title="Display name" style={{ minHeight: 72 }} />);

    expect(StyleSheet.flatten(screen.getByTestId('row').props.style).minHeight).toBe(72);
  });

  it('forwards a ref to the underlying TextInput', async () => {
    const ref = createRef<TextInput>();
    await wrap(<EntryRow ref={ref} title="Display name" />);

    expect(ref.current).not.toBeNull();
  });
});
