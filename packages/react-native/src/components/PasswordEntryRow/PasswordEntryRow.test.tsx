import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { createRef, type ReactElement } from 'react';
import type { TextInput } from 'react-native';
import { Text as RNText, StyleSheet } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { PasswordEntryRow } from './PasswordEntryRow';

const wrap = (ui: ReactElement) => render(<GnomeProvider colorScheme="light">{ui}</GnomeProvider>);

const field = (name = 'Password') => screen.getByLabelText(name);
const revealButton = () => screen.getByLabelText('Reveal password');
const concealButton = () => screen.getByLabelText('Conceal password');

describe('PasswordEntryRow', () => {
  it('renders the title as the field name', async () => {
    await wrap(<PasswordEntryRow title="Password" />);

    expect(field()).toBeOnTheScreen();
  });

  describe('masking', () => {
    it('masks the input by default', async () => {
      await wrap(<PasswordEntryRow title="Password" />);

      expect(field().props.secureTextEntry).toBe(true);
    });

    it('unmasks when the reveal button is pressed', async () => {
      await wrap(<PasswordEntryRow title="Password" />);

      await act(async () => {
        fireEvent.press(revealButton());
      });

      expect(field().props.secureTextEntry).toBe(false);
    });

    it('masks again on a second press', async () => {
      await wrap(<PasswordEntryRow title="Password" />);

      await act(async () => {
        fireEvent.press(revealButton());
      });
      await act(async () => {
        fireEvent.press(concealButton());
      });

      expect(field().props.secureTextEntry).toBe(true);
    });
  });

  describe('reveal button', () => {
    it('swaps its accessible name with the state', async () => {
      await wrap(<PasswordEntryRow title="Password" />);

      expect(revealButton()).toBeOnTheScreen();

      await act(async () => {
        fireEvent.press(revealButton());
      });

      expect(concealButton()).toBeOnTheScreen();
      expect(screen.queryByLabelText('Reveal password')).toBeNull();
    });

    it('reports the toggle state to assistive tech', async () => {
      await wrap(<PasswordEntryRow title="Password" />);

      expect(revealButton().props.accessibilityState.selected).toBe(false);

      await act(async () => {
        fireEvent.press(revealButton());
      });

      expect(concealButton().props.accessibilityState.selected).toBe(true);
    });

    it('is disabled along with the row', async () => {
      await wrap(<PasswordEntryRow title="Password" disabled />);

      expect(revealButton().props.accessibilityState.disabled).toBe(true);
      expect(field().props.editable).toBe(false);
    });

    it('does not unmask while disabled', async () => {
      await wrap(<PasswordEntryRow title="Password" disabled />);

      await act(async () => {
        fireEvent.press(revealButton());
      });

      expect(field().props.secureTextEntry).toBe(true);
    });
  });

  describe('autoComplete', () => {
    it('defaults to current-password so password managers can offer a credential', async () => {
      await wrap(<PasswordEntryRow title="Password" />);

      expect(field().props.autoComplete).toBe('current-password');
    });

    it('accepts new-password for registration forms', async () => {
      await wrap(<PasswordEntryRow title="Password" autoComplete="new-password" />);

      expect(field().props.autoComplete).toBe('new-password');
    });
  });

  it('places consumer trailing content before the reveal button', async () => {
    await wrap(<PasswordEntryRow title="Password" trailing={<RNText>extra</RNText>} />);

    expect(screen.getByText('extra')).toBeOnTheScreen();
    expect(revealButton()).toBeOnTheScreen();
  });

  describe('value', () => {
    it('reports changes through onValueChange', async () => {
      const onValueChange = jest.fn();
      await wrap(<PasswordEntryRow title="Password" onValueChange={onValueChange} />);

      await act(async () => {
        fireEvent.changeText(field(), 'hunter2');
      });

      expect(onValueChange).toHaveBeenCalledWith('hunter2');
    });

    it('honours a controlled value', async () => {
      await wrap(<PasswordEntryRow title="Password" value="hunter2" />);

      expect(field().props.value).toBe('hunter2');
    });
  });

  it('inherits the row metrics from EntryRow', async () => {
    await wrap(<PasswordEntryRow testID="row" title="Password" />);

    expect(StyleSheet.flatten(screen.getByTestId('row').props.style).minHeight).toBe(56);
  });

  it('forwards a ref to the underlying TextInput', async () => {
    const ref = createRef<TextInput>();
    await wrap(<PasswordEntryRow ref={ref} title="Password" />);

    expect(ref.current).not.toBeNull();
  });
});
