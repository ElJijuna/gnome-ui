import { render, screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';

import { Blockquote } from './Blockquote';

const styleOf = (testID: string) => StyleSheet.flatten(screen.getByTestId(testID).props.style);

describe('Blockquote', () => {
  it('renders the quoted content', async () => {
    await render(<Blockquote>The quick brown fox</Blockquote>);

    expect(screen.getByText('The quick brown fox')).toBeOnTheScreen();
  });

  it('renders cite when provided', async () => {
    await render(<Blockquote cite="Ada Lovelace">Some quote</Blockquote>);

    expect(screen.getByText('Ada Lovelace')).toBeOnTheScreen();
  });

  it('does not render cite when omitted', async () => {
    await render(<Blockquote>No cite</Blockquote>);

    expect(screen.queryByText('Ada Lovelace')).not.toBeOnTheScreen();
  });

  it('renders icon when provided', async () => {
    await render(<Blockquote icon={<Text testID="icon">★</Text>}>Text</Blockquote>);

    expect(screen.getByTestId('icon', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  describe('variants', () => {
    it('uses the subtle border color and a transparent background by default', async () => {
      await render(<Blockquote testID="bq">Text</Blockquote>);

      expect(styleOf('bq').borderLeftColor).toBe('rgba(0, 0, 0, 0.15)');
      expect(styleOf('bq').backgroundColor).toBe('transparent');
    });

    it.each([
      'info',
      'warning',
      'error',
      'success',
    ] as const)('tints the border and background for the %s variant', async (variant) => {
      await render(
        <Blockquote testID="bq" variant={variant}>
          Text
        </Blockquote>,
      );

      expect(styleOf('bq').borderLeftColor).not.toBe('rgba(0, 0, 0, 0.15)');
      expect(styleOf('bq').backgroundColor).not.toBe('transparent');
    });
  });

  it('merges a consumer style over its own', async () => {
    await render(
      <Blockquote testID="bq" style={{ borderLeftWidth: 6 }}>
        Text
      </Blockquote>,
    );

    expect(styleOf('bq').borderLeftWidth).toBe(6);
  });

  it('forwards extra view props', async () => {
    await render(
      <Blockquote testID="bq" accessibilityLabel="Quote">
        Text
      </Blockquote>,
    );

    expect(screen.getByTestId('bq').props.accessibilityLabel).toBe('Quote');
  });
});
