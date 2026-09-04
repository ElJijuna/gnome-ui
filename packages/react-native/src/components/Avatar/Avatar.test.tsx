import { render, screen } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  describe('rendering', () => {
    it('renders initials from name when no src is provided', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Avatar name="Alice Bob" />
        </GnomeProvider>,
      );

      expect(screen.getByText('AB', { includeHiddenElements: true })).toBeOnTheScreen();
    });

    it('renders an image when src is provided', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Avatar name="Alice" src="https://example.com/alice.jpg" />
        </GnomeProvider>,
      );

      const image = screen.getByTestId('avatar-image', { includeHiddenElements: true });

      expect(image.props.source).toEqual({ uri: 'https://example.com/alice.jpg' });
    });

    it('does not render initials when src is provided', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Avatar name="Alice" src="https://example.com/alice.jpg" />
        </GnomeProvider>,
      );

      expect(screen.queryByText('A', { includeHiddenElements: true })).not.toBeOnTheScreen();
    });

    it('does not render an image when src is omitted', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Avatar name="Alice" />
        </GnomeProvider>,
      );

      expect(
        screen.queryByTestId('avatar-image', { includeHiddenElements: true }),
      ).not.toBeOnTheScreen();
    });
  });

  describe('initials', () => {
    it('generates a single initial from a one-word name', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Avatar name="Alice" />
        </GnomeProvider>,
      );

      expect(screen.getByText('A', { includeHiddenElements: true })).toBeOnTheScreen();
    });

    it('generates two initials from a two-word name', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Avatar name="John Doe" />
        </GnomeProvider>,
      );

      expect(screen.getByText('JD', { includeHiddenElements: true })).toBeOnTheScreen();
    });
  });

  describe('accessibility label', () => {
    it('uses name as the accessible label by default', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Avatar name="Alice" />
        </GnomeProvider>,
      );

      expect(screen.getByRole('img', { name: 'Alice' })).toBeOnTheScreen();
    });

    it('uses explicit alt text over name', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Avatar name="Alice" alt="Profile photo" />
        </GnomeProvider>,
      );

      expect(screen.getByRole('img', { name: 'Profile photo' })).toBeOnTheScreen();
    });

    it('falls back to "Avatar" when neither alt nor name is given', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Avatar />
        </GnomeProvider>,
      );

      expect(screen.getByRole('img', { name: 'Avatar' })).toBeOnTheScreen();
    });
  });

  describe('sizes', () => {
    it.each([
      ['sm', 24],
      ['md', 32],
      ['lg', 48],
      ['xl', 64],
    ] as const)('applies the %s box size', async (size, box) => {
      await render(
        <GnomeProvider colorScheme="light">
          <Avatar name="A" size={size} />
        </GnomeProvider>,
      );

      expect(screen.getByRole('img', { name: 'A' })).toHaveStyle({ width: box, height: box });
    });
  });
});
