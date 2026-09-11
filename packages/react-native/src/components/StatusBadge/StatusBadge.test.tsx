import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { lightTheme } from '@/theme';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  describe('rendering', () => {
    it('renders string children as text', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <StatusBadge>published</StatusBadge>
        </GnomeProvider>,
      );

      expect(screen.getByText('published')).toBeOnTheScreen();
    });

    it('renders number children as text', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <StatusBadge>{7}</StatusBadge>
        </GnomeProvider>,
      );

      expect(screen.getByText('7')).toBeOnTheScreen();
    });

    it('renders a non-string/number child as-is', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <StatusBadge>
            <Text testID="custom">custom</Text>
          </StatusBadge>
        </GnomeProvider>,
      );

      expect(screen.getByTestId('custom')).toBeOnTheScreen();
    });
  });

  describe('variants', () => {
    it('defaults to neutral', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <StatusBadge testID="badge">draft</StatusBadge>
        </GnomeProvider>,
      );

      expect(screen.getByTestId('badge')).toHaveStyle({
        backgroundColor: lightTheme.hoverOverlay,
      });
    });

    it.each([
      ['success', lightTheme.successBgColor],
      ['warning', lightTheme.warningBgColor],
      ['error', lightTheme.errorBgColor],
      ['new', lightTheme.newBgColor],
      ['accent', lightTheme.accentBgColor],
      ['neutral', lightTheme.hoverOverlay],
    ] as const)('applies the %s variant background', async (variant, bg) => {
      await render(
        <GnomeProvider colorScheme="light">
          <StatusBadge testID="badge" variant={variant}>
            label
          </StatusBadge>
        </GnomeProvider>,
      );

      expect(screen.getByTestId('badge')).toHaveStyle({ backgroundColor: bg });
    });
  });

  it('forwards extra view props', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <StatusBadge testID="badge" accessibilityLabel="Status: published">
          published
        </StatusBadge>
      </GnomeProvider>,
    );

    expect(screen.getByTestId('badge').props.accessibilityLabel).toBe('Status: published');
  });
});
