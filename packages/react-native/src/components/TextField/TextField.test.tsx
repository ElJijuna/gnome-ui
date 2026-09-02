import { fireEvent, render, screen } from '@testing-library/react-native';
import { createRef, type ReactElement } from 'react';
import type { TextInput } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { TextField } from './TextField';

function renderWithProvider(ui: ReactElement) {
  return render(<GnomeProvider colorScheme="light">{ui}</GnomeProvider>);
}

describe('TextField', () => {
  describe('rendering', () => {
    it('renders a text input', async () => {
      await renderWithProvider(<TextField testID="field" />);
      expect(screen.getByTestId('field')).toBeOnTheScreen();
    });

    it('renders a label when provided', async () => {
      await renderWithProvider(<TextField label="Username" />);
      expect(screen.getByText('Username')).toBeOnTheScreen();
    });

    it('does not render a label when omitted', async () => {
      await renderWithProvider(<TextField helperText="Helper" />);
      expect(screen.queryByText('Username')).toBeNull();
    });

    it('renders helper text below the input', async () => {
      await renderWithProvider(<TextField helperText="Enter your username" />);
      expect(screen.getByText('Enter your username')).toBeOnTheScreen();
    });

    it('renders error message instead of helper text', async () => {
      await renderWithProvider(<TextField helperText="Helper" error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeOnTheScreen();
      expect(screen.queryByText('Helper')).toBeNull();
    });

    it('does not render a hint row when neither error nor helperText is set', async () => {
      await renderWithProvider(<TextField label="Username" />);
      expect(screen.queryByText('Helper')).toBeNull();
      expect(screen.queryByText('Required')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('uses the label as the accessibilityLabel', async () => {
      const ref = createRef<TextInput>();

      await renderWithProvider(<TextField label="Email" ref={ref} />);
      expect(ref.current?.props.accessibilityLabel).toBe('Email');
    });

    it('lets an explicit accessibilityLabel override the label', async () => {
      const ref = createRef<TextInput>();

      await renderWithProvider(
        <TextField label="Email" accessibilityLabel="Email address" ref={ref} />,
      );
      expect(ref.current?.props.accessibilityLabel).toBe('Email address');
    });

    it('uses helperText as the accessibilityHint', async () => {
      const ref = createRef<TextInput>();

      await renderWithProvider(<TextField helperText="Some hint" ref={ref} />);
      expect(ref.current?.props.accessibilityHint).toBe('Some hint');
    });

    it('prefers error over helperText for the accessibilityHint', async () => {
      const ref = createRef<TextInput>();

      await renderWithProvider(<TextField helperText="Helper" error="Required" ref={ref} />);
      expect(ref.current?.props.accessibilityHint).toBe('Required');
    });
  });

  describe('visual state', () => {
    it('applies the error border color when error is set', async () => {
      await renderWithProvider(<TextField error="Required" testID="field" />);
      expect(screen.getByTestId('field')).toHaveStyle({ borderColor: '#e01b24' });
    });

    it('applies the subtle border color when idle', async () => {
      await renderWithProvider(<TextField testID="field" />);
      expect(screen.getByTestId('field')).toHaveStyle({ borderColor: 'rgba(0, 0, 0, 0.15)' });
    });

    it('applies the accent border color while focused', async () => {
      await renderWithProvider(<TextField testID="field" />);
      await fireEvent(screen.getByTestId('field'), 'focus', { nativeEvent: {} });
      expect(screen.getByTestId('field')).toHaveStyle({ borderColor: '#3584e4' });
    });

    it('keeps the error border color even while focused', async () => {
      await renderWithProvider(<TextField error="Required" testID="field" />);
      await fireEvent(screen.getByTestId('field'), 'focus', { nativeEvent: {} });
      expect(screen.getByTestId('field')).toHaveStyle({ borderColor: '#e01b24' });
    });

    it('reverts to the idle border color on blur', async () => {
      await renderWithProvider(<TextField testID="field" />);
      await fireEvent(screen.getByTestId('field'), 'focus', { nativeEvent: {} });
      await fireEvent(screen.getByTestId('field'), 'blur', { nativeEvent: {} });
      expect(screen.getByTestId('field')).toHaveStyle({ borderColor: 'rgba(0, 0, 0, 0.15)' });
    });

    it('dims the wrapper when not editable', async () => {
      await renderWithProvider(<TextField editable={false} label="Username" />);
      const label = screen.getByText('Username');

      expect(label.parent).toHaveStyle({ opacity: 0.5 });
    });

    it('dims the helper text but not the error text', async () => {
      await renderWithProvider(<TextField helperText="Helper" />);
      expect(screen.getByText('Helper')).toHaveStyle({ opacity: 0.55 });
    });

    it('shows full opacity for error text', async () => {
      await renderWithProvider(<TextField error="Required" />);
      expect(screen.getByText('Required')).toHaveStyle({ opacity: 1 });
    });
  });

  describe('interactions', () => {
    it('calls onChangeText when the user types', async () => {
      const onChangeText = jest.fn();

      await renderWithProvider(<TextField onChangeText={onChangeText} testID="field" />);
      await fireEvent.changeText(screen.getByTestId('field'), 'hello');

      expect(onChangeText).toHaveBeenCalledWith('hello');
    });

    it('calls a custom onFocus alongside the internal focus handling', async () => {
      const onFocus = jest.fn();

      await renderWithProvider(<TextField onFocus={onFocus} testID="field" />);
      await fireEvent(screen.getByTestId('field'), 'focus', { nativeEvent: {} });

      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('calls a custom onBlur alongside the internal blur handling', async () => {
      const onBlur = jest.fn();

      await renderWithProvider(<TextField onBlur={onBlur} testID="field" />);
      await fireEvent(screen.getByTestId('field'), 'blur', { nativeEvent: {} });

      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('prop forwarding', () => {
    it('does not set editable=false by default', async () => {
      const ref = createRef<TextInput>();

      await renderWithProvider(<TextField ref={ref} />);
      expect(ref.current?.props.editable).not.toBe(false);
    });

    it('forwards editable=false', async () => {
      const ref = createRef<TextInput>();

      await renderWithProvider(<TextField editable={false} ref={ref} />);
      expect(ref.current?.props.editable).toBe(false);
    });

    it('forwards placeholder', async () => {
      await renderWithProvider(<TextField placeholder="you@example.com" />);
      expect(screen.getByPlaceholderText('you@example.com')).toBeOnTheScreen();
    });

    it('forwards testID', async () => {
      await renderWithProvider(<TextField testID="my-field" />);
      expect(screen.getByTestId('my-field')).toBeOnTheScreen();
    });

    it('merges a custom inputStyle over the input', async () => {
      await renderWithProvider(<TextField inputStyle={{ fontSize: 20 }} testID="field" />);
      expect(screen.getByTestId('field')).toHaveStyle({ fontSize: 20 });
    });

    it('forwards a ref to the underlying TextInput', async () => {
      const ref = createRef<TextInput>();

      await renderWithProvider(<TextField ref={ref} />);
      expect(ref.current).not.toBeNull();
    });
  });
});
