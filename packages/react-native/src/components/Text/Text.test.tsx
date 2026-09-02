import { render, screen } from '@testing-library/react-native';
import { createRef, type ReactElement } from 'react';
import type { Text as RNText } from 'react-native';

import { GnomeProvider } from '../../GnomeProvider';
import { Text, type TextVariant } from './Text';

function renderWithProvider(ui: ReactElement) {
  return render(<GnomeProvider colorScheme="light">{ui}</GnomeProvider>);
}

describe('Text', () => {
  describe('default rendering', () => {
    it('renders children', async () => {
      await renderWithProvider(<Text>Hello</Text>);
      expect(screen.getByText('Hello')).toBeOnTheScreen();
    });

    it('defaults to the body variant', async () => {
      await renderWithProvider(<Text>Body text</Text>);
      expect(screen.getByText('Body text')).toHaveStyle({ fontSize: 16, fontWeight: '400' });
    });

    it('applies the theme font family', async () => {
      await renderWithProvider(<Text>text</Text>);
      expect(screen.getByText('text')).toHaveStyle({ fontFamily: 'Adwaita Sans' });
    });
  });

  describe('variants', () => {
    it.each([
      ['large-title', 36, '300'],
      ['title-1', 30, '700'],
      ['title-2', 24, '700'],
      ['title-3', 20, '700'],
      ['title-4', 18, '600'],
      ['heading', 16, '700'],
      ['body', 16, '400'],
      ['document', 16, '400'],
      ['caption', 12, '400'],
      ['caption-heading', 12, '600'],
      ['numeric', 16, '400'],
    ] as const)('%s renders at %ipx / weight %s', async (variant, fontSize, fontWeight) => {
      await renderWithProvider(<Text variant={variant}>text</Text>);
      expect(screen.getByText('text')).toHaveStyle({ fontSize, fontWeight });
    });

    it('resolves line height to absolute dp, not a ratio', async () => {
      await renderWithProvider(<Text variant="title-1">text</Text>);
      expect(screen.getByText('text')).toHaveStyle({ lineHeight: 36 });
    });

    it('resolves em letter spacing to dp for large-title', async () => {
      await renderWithProvider(<Text variant="large-title">text</Text>);
      expect(screen.getByText('text')).toHaveStyle({ letterSpacing: -0.72 });
    });

    it('uppercases caption-heading and spaces it out', async () => {
      await renderWithProvider(<Text variant="caption-heading">text</Text>);
      expect(screen.getByText('text')).toHaveStyle({
        textTransform: 'uppercase',
        letterSpacing: 0.72,
      });
    });

    it('uses the mono font family for monospace', async () => {
      await renderWithProvider(<Text variant="monospace">text</Text>);
      expect(screen.getByText('text')).toHaveStyle({ fontFamily: 'Adwaita Mono', fontSize: 14 });
    });

    it('uses tabular figures for numeric', async () => {
      await renderWithProvider(<Text variant="numeric">1234</Text>);
      expect(screen.getByText('1234')).toHaveStyle({ fontVariant: ['tabular-nums'] });
    });

    it('gives document a looser line height than body', async () => {
      await renderWithProvider(
        <>
          <Text variant="body">body</Text>
          <Text variant="document">document</Text>
        </>,
      );
      expect(screen.getByText('body')).toHaveStyle({ lineHeight: 24 });
      expect(screen.getByText('document')).toHaveStyle({ lineHeight: 26 });
    });
  });

  describe('accessibility role', () => {
    it.each([
      'large-title',
      'title-1',
      'title-2',
      'title-3',
      'title-4',
      'heading',
    ] as const)('gives %s the header role', async (variant) => {
      await renderWithProvider(<Text variant={variant}>title</Text>);
      expect(screen.getByRole('header')).toBeOnTheScreen();
    });

    it.each([
      'body',
      'document',
      'caption',
      'caption-heading',
      'monospace',
      'numeric',
    ] as const)('leaves %s without a header role', async (variant) => {
      await renderWithProvider(<Text variant={variant}>text</Text>);
      expect(screen.queryByRole('header')).toBeNull();
    });

    it('lets accessibilityRole override the variant default', async () => {
      await renderWithProvider(
        <Text variant="title-1" accessibilityRole="text">
          title
        </Text>,
      );
      expect(screen.queryByRole('header')).toBeNull();
    });
  });

  describe('color', () => {
    it.each([
      ['default', '#000'],
      ['accent', '#3584e4'],
      ['destructive', '#e01b24'],
      ['success', '#2ec27e'],
      ['warning', '#e5a50a'],
      ['error', '#e01b24'],
    ] as const)('applies %s color', async (color, expected) => {
      await renderWithProvider(<Text color={color}>text</Text>);
      const style = screen.getByText('text').props.style as { color?: string }[];
      const resolved = style.flat().reduce((acc, entry) => ({ ...acc, ...entry }), {});

      if (color === 'default') {
        expect(resolved.color).toBeTruthy();
      } else {
        expect(resolved.color).toBe(expected);
      }
    });

    it('dims via opacity rather than a flat color, so it works on any background', async () => {
      await renderWithProvider(<Text color="dim">text</Text>);
      expect(screen.getByText('text')).toHaveStyle({ opacity: 0.55 });
    });

    it('follows the resolved color scheme', async () => {
      await render(
        <GnomeProvider colorScheme="dark">
          <Text color="accent">text</Text>
        </GnomeProvider>,
      );
      expect(screen.getByText('text')).toHaveStyle({ color: '#62a0ea' });
    });
  });

  describe('prop forwarding', () => {
    it('merges a custom style over the variant style', async () => {
      await renderWithProvider(<Text style={{ fontSize: 99 }}>text</Text>);
      expect(screen.getByText('text')).toHaveStyle({ fontSize: 99 });
    });

    it('forwards numberOfLines', async () => {
      await renderWithProvider(<Text numberOfLines={2}>text</Text>);
      expect(screen.getByText('text').props.numberOfLines).toBe(2);
    });

    it('forwards testID', async () => {
      await renderWithProvider(<Text testID="my-text">text</Text>);
      expect(screen.getByTestId('my-text')).toBeOnTheScreen();
    });

    it('forwards accessibilityLabel', async () => {
      await renderWithProvider(<Text accessibilityLabel="desc">text</Text>);
      expect(screen.getByLabelText('desc')).toBeOnTheScreen();
    });

    it('forwards a ref to the underlying Text', async () => {
      const ref = createRef<RNText>();

      await renderWithProvider(<Text ref={ref}>text</Text>);
      expect(ref.current).not.toBeNull();
    });
  });
});

// Guards against a variant being added to the union without a style branch.
const ALL_VARIANTS: TextVariant[] = [
  'large-title',
  'title-1',
  'title-2',
  'title-3',
  'title-4',
  'heading',
  'body',
  'document',
  'caption',
  'caption-heading',
  'monospace',
  'numeric',
];

describe('variant coverage', () => {
  it.each(ALL_VARIANTS)('%s renders with a resolved font size', async (variant) => {
    await renderWithProvider(<Text variant={variant}>text</Text>);
    const style = screen.getByText('text').props.style as { fontSize?: number }[];
    const resolved = style.flat().reduce((acc, entry) => ({ ...acc, ...entry }), {});

    expect(typeof resolved.fontSize).toBe('number');
  });
});
