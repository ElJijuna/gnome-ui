import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { lightTheme } from '@/theme';
import { Badge } from './Badge';

describe('Badge', () => {
  describe('rendering', () => {
    it('renders children as text', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Badge>42</Badge>
        </GnomeProvider>,
      );

      expect(screen.getByText('42')).toBeOnTheScreen();
    });

    it('does not render children when dot is true', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Badge dot>99</Badge>
        </GnomeProvider>,
      );

      expect(screen.queryByText('99')).not.toBeOnTheScreen();
    });

    it('sizes the dot smaller than a labeled badge', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Badge dot />
        </GnomeProvider>,
      );

      expect(screen.getByTestId('badge')).toHaveStyle({ minWidth: 10, height: 10 });
    });
  });

  describe('variants', () => {
    it('defaults to the accent variant', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Badge>1</Badge>
        </GnomeProvider>,
      );

      expect(screen.getByTestId('badge')).toHaveStyle({
        backgroundColor: lightTheme.accentBgColor,
      });
    });

    it.each([
      ['success', 'successBgColor'],
      ['warning', 'warningBgColor'],
      ['error', 'errorBgColor'],
    ] as const)('applies the %s variant background', async (variant, tokenKey) => {
      await render(
        <GnomeProvider colorScheme="light">
          <Badge variant={variant}>1</Badge>
        </GnomeProvider>,
      );

      expect(screen.getByTestId('badge')).toHaveStyle({
        backgroundColor: lightTheme[tokenKey],
      });
    });

    it('resolves neutral to the light/dark scale rather than a semantic token', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Badge variant="neutral">1</Badge>
        </GnomeProvider>,
      );

      expect(screen.getByTestId('badge')).toHaveStyle({ backgroundColor: lightTheme.light4 });
    });
  });

  describe('anchor mode', () => {
    it('renders the anchor content alongside the badge', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Badge anchor={<Text>Icon</Text>}>3</Badge>
        </GnomeProvider>,
      );

      expect(screen.getByText('Icon')).toBeOnTheScreen();
      expect(screen.getByText('3')).toBeOnTheScreen();
    });

    it('positions a labeled badge at -4/-4', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Badge anchor={<Text>Icon</Text>}>3</Badge>
        </GnomeProvider>,
      );

      expect(screen.getByTestId('badge-ring')).toHaveStyle({ top: -4, right: -4 });
    });

    it('positions a dot badge at -2/-2', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Badge dot anchor={<Text>Icon</Text>} />
        </GnomeProvider>,
      );

      expect(screen.getByTestId('badge-ring')).toHaveStyle({ top: -2, right: -2 });
    });

    it('does not position the badge absolutely when no anchor is given', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Badge>3</Badge>
        </GnomeProvider>,
      );

      expect(screen.getByTestId('badge-ring')).not.toHaveStyle({ position: 'absolute' });
    });
  });
});
