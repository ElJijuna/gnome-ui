import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { createRef, type ReactElement } from 'react';
import type { TextInput } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { PasswordField } from './PasswordField';

const wrap = (ui: ReactElement) => render(<GnomeProvider colorScheme="light">{ui}</GnomeProvider>);

const field = (name = 'Password') => screen.getByLabelText(name);
const revealButton = () => screen.getByLabelText('Show password');
const concealButton = () => screen.getByLabelText('Hide password');

describe('PasswordField', () => {
  it('renders the label', async () => {
    await wrap(<PasswordField label="Password" />);

    expect(screen.getByText('Password')).toBeOnTheScreen();
    expect(field()).toBeOnTheScreen();
  });

  describe('masking', () => {
    it('masks the input by default', async () => {
      await wrap(<PasswordField label="Password" />);

      expect(field().props.secureTextEntry).toBe(true);
    });

    it('unmasks when the reveal button is pressed', async () => {
      await wrap(<PasswordField label="Password" />);

      await act(async () => {
        fireEvent.press(revealButton());
      });

      expect(field().props.secureTextEntry).toBe(false);
    });

    it('masks again on a second press', async () => {
      await wrap(<PasswordField label="Password" />);

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
      await wrap(<PasswordField label="Password" />);

      expect(revealButton()).toBeOnTheScreen();

      await act(async () => {
        fireEvent.press(revealButton());
      });

      expect(concealButton()).toBeOnTheScreen();
      expect(screen.queryByLabelText('Show password')).toBeNull();
    });

    it('reports the toggle state to assistive tech', async () => {
      await wrap(<PasswordField label="Password" />);

      expect(revealButton().props.accessibilityState.selected).toBe(false);

      await act(async () => {
        fireEvent.press(revealButton());
      });

      expect(concealButton().props.accessibilityState.selected).toBe(true);
    });

    it('accepts custom reveal/conceal labels', async () => {
      await wrap(<PasswordField label="Password" revealLabel="Peek" concealLabel="Unpeek" />);

      expect(screen.getByLabelText('Peek')).toBeOnTheScreen();
    });

    it('is hidden when revealable is false', async () => {
      await wrap(<PasswordField label="Password" revealable={false} />);

      expect(screen.queryByLabelText('Show password')).toBeNull();
      expect(field().props.secureTextEntry).toBe(true);
    });

    it('is disabled along with the field', async () => {
      await wrap(<PasswordField label="Password" editable={false} />);

      expect(revealButton().props.accessibilityState.disabled).toBe(true);
      expect(field().props.editable).toBe(false);
    });

    it('does not unmask while disabled', async () => {
      await wrap(<PasswordField label="Password" editable={false} />);

      await act(async () => {
        fireEvent.press(revealButton());
      });

      expect(field().props.secureTextEntry).toBe(true);
    });
  });

  describe('hint / error', () => {
    it('renders helper text below the input', async () => {
      await wrap(<PasswordField label="Password" helperText="At least 8 characters" />);

      expect(screen.getByText('At least 8 characters')).toBeOnTheScreen();
    });

    it('renders error instead of helper text', async () => {
      await wrap(
        <PasswordField label="Password" helperText="Helper" error="Password is too short" />,
      );

      expect(screen.getByText('Password is too short')).toBeOnTheScreen();
      expect(screen.queryByText('Helper')).toBeNull();
    });
  });

  it('reports changes through onChangeText', async () => {
    const onChangeText = jest.fn();
    await wrap(<PasswordField label="Password" onChangeText={onChangeText} />);

    await act(async () => {
      fireEvent.changeText(field(), 'hunter2');
    });

    expect(onChangeText).toHaveBeenCalledWith('hunter2');
  });

  it('honours a controlled value', async () => {
    await wrap(<PasswordField label="Password" value="hunter2" onChangeText={() => {}} />);

    expect(field().props.value).toBe('hunter2');
  });

  it('forwards a ref to the underlying TextInput', async () => {
    const ref = createRef<TextInput>();
    await wrap(<PasswordField label="Password" ref={ref} />);

    expect(ref.current).not.toBeNull();
  });
});
