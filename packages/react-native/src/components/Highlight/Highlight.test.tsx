import { render, screen } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { highContrastTheme, lightTheme } from '@/theme';
import { Highlight } from './Highlight';

describe('Highlight', () => {
  describe('rendering', () => {
    it('renders the full text', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Highlight text="Hello world" query="world" />
        </GnomeProvider>,
      );

      expect(screen.getByText(/^Hello/)).toBeOnTheScreen();
      expect(screen.getByText('world')).toBeOnTheScreen();
    });

    it('highlights the matched term with the accent background', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Highlight text="Hello world" query="world" />
        </GnomeProvider>,
      );

      expect(screen.getByText('world')).toHaveStyle({
        backgroundColor: `${lightTheme.accentBgColor}4D`,
      });
    });

    it('wraps every occurrence of the term', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Highlight text="cat bat cat mat" query="cat" />
        </GnomeProvider>,
      );

      expect(screen.getAllByText('cat')).toHaveLength(2);
    });

    it('renders no highlighted run when the term is not found', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Highlight text="Hello world" query="xyz" />
        </GnomeProvider>,
      );

      expect(screen.getByText('Hello world')).toBeOnTheScreen();
    });

    it('renders no highlighted run when query is an empty string', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Highlight text="Hello world" query="" />
        </GnomeProvider>,
      );

      expect(screen.getByText('Hello world')).toBeOnTheScreen();
    });

    it('ignores whitespace-only terms in a query array', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Highlight text="Hello world" query={['  ', 'world']} />
        </GnomeProvider>,
      );

      expect(screen.getByText('world')).toHaveStyle({
        backgroundColor: `${lightTheme.accentBgColor}4D`,
      });
    });
  });

  describe('multiple terms', () => {
    it('highlights every distinct term from an array', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Highlight text="The quick brown fox" query={['quick', 'fox']} />
        </GnomeProvider>,
      );

      expect(screen.getByText('quick')).toBeOnTheScreen();
      expect(screen.getByText('fox')).toBeOnTheScreen();
    });
  });

  describe('case sensitivity', () => {
    it('matches case-insensitively by default', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Highlight text="Hello World" query="world" />
        </GnomeProvider>,
      );

      expect(screen.getByText('World')).toHaveStyle({
        backgroundColor: `${lightTheme.accentBgColor}4D`,
      });
    });

    it('does not match case-sensitively when caseSensitive is set', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Highlight text="Hello World" query="world" caseSensitive />
        </GnomeProvider>,
      );

      expect(screen.getByText('Hello World')).toBeOnTheScreen();
    });

    it('finds a case-sensitive match when the case lines up', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Highlight text="Hello World" query="World" caseSensitive />
        </GnomeProvider>,
      );

      expect(screen.getByText('World')).toHaveStyle({
        backgroundColor: `${lightTheme.accentBgColor}4D`,
      });
    });
  });

  describe('special characters', () => {
    it('treats regex special characters in the query literally', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Highlight text="a.b (c) [d]" query="(c)" />
        </GnomeProvider>,
      );

      expect(screen.getByText('(c)')).toBeOnTheScreen();
    });
  });

  describe('high contrast', () => {
    it('uses a solid accent background and white text', async () => {
      await render(
        <GnomeProvider colorScheme="light" contrast="more">
          <Highlight text="Hello world" query="world" />
        </GnomeProvider>,
      );

      expect(screen.getByText('world')).toHaveStyle({
        backgroundColor: highContrastTheme.accentBgColor,
        color: '#fff',
      });
    });
  });
});
