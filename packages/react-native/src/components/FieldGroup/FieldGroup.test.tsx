import { render, screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';

import { FieldGroup } from './FieldGroup';

const styleOf = (testID: string) => StyleSheet.flatten(screen.getByTestId(testID).props.style);

describe('FieldGroup', () => {
  describe('rendering', () => {
    it('exposes role="group"', async () => {
      await render(
        <FieldGroup label="Notifications" testID="group">
          <Text>content</Text>
        </FieldGroup>,
      );

      expect(screen.getByTestId('group').props.role).toBe('group');
    });

    it('renders the label', async () => {
      await render(
        <FieldGroup label="Notifications">
          <Text>content</Text>
        </FieldGroup>,
      );

      expect(screen.getByText('Notifications')).toBeOnTheScreen();
    });

    it('renders its children', async () => {
      await render(
        <FieldGroup label="Notifications">
          <Text>Enable</Text>
        </FieldGroup>,
      );

      expect(screen.getByText('Enable')).toBeOnTheScreen();
    });

    it('renders helper text below the label', async () => {
      await render(
        <FieldGroup label="Notifications" helperText="Choose how you want to be notified.">
          <Text>content</Text>
        </FieldGroup>,
      );

      expect(screen.getByText('Choose how you want to be notified.')).toBeOnTheScreen();
    });

    it('renders error message instead of helper text', async () => {
      await render(
        <FieldGroup label="Notifications" helperText="Helper" error="Select at least one option.">
          <Text>content</Text>
        </FieldGroup>,
      );

      expect(screen.getByText('Select at least one option.')).toBeOnTheScreen();
      expect(screen.queryByText('Helper')).not.toBeOnTheScreen();
    });

    it('does not render an alert when neither helperText nor error is set', async () => {
      await render(
        <FieldGroup label="Notifications">
          <Text>content</Text>
        </FieldGroup>,
      );

      expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('gives the error message role="alert"', async () => {
      await render(
        <FieldGroup label="Notifications" error="Select at least one option.">
          <Text>content</Text>
        </FieldGroup>,
      );

      expect(screen.getByRole('alert')).toBeOnTheScreen();
    });

    it('does not give helper text role="alert"', async () => {
      await render(
        <FieldGroup label="Notifications" helperText="Hint">
          <Text>content</Text>
        </FieldGroup>,
      );

      expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
    });
  });

  describe('disabled', () => {
    it('dims the group when disabled', async () => {
      await render(
        <FieldGroup label="Notifications" disabled testID="group">
          <Text>content</Text>
        </FieldGroup>,
      );

      expect(styleOf('group').opacity).toBeLessThan(1);
    });

    it('is fully opaque when not disabled', async () => {
      await render(
        <FieldGroup label="Notifications" testID="group">
          <Text>content</Text>
        </FieldGroup>,
      );

      expect(styleOf('group').opacity).toBe(1);
    });
  });

  it('forwards extra view props', async () => {
    await render(
      <FieldGroup label="Notifications" testID="group" accessibilityLabel="Notif group">
        <Text>content</Text>
      </FieldGroup>,
    );

    expect(screen.getByTestId('group').props.accessibilityLabel).toBe('Notif group');
  });
});
