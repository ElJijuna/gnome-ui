import { StarOutline } from '@gnome-ui/icons';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import type { View } from 'react-native';
import { Text as RNText, StyleSheet } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { StatusPage } from './StatusPage';

const wrap = (ui: ReactElement) => <GnomeProvider colorScheme="light">{ui}</GnomeProvider>;

/** `style` arrives as a nested array — flatten before asserting on it. */
const styleOf = (testID: string) => StyleSheet.flatten(screen.getByTestId(testID).props.style);

describe('StatusPage', () => {
  it('renders the title', async () => {
    await render(wrap(<StatusPage title="No results" />));

    expect(screen.getByText('No results')).toBeOnTheScreen();
  });

  it('exposes the title as a heading', async () => {
    await render(wrap(<StatusPage title="No results" />));

    expect(screen.getByRole('header', { name: 'No results' })).toBeOnTheScreen();
  });

  describe('description', () => {
    it('renders when provided', async () => {
      await render(wrap(<StatusPage title="No results" description="Try another search." />));

      expect(screen.getByText('Try another search.')).toBeOnTheScreen();
    });

    it('is omitted entirely when not provided', async () => {
      await render(wrap(<StatusPage title="No results" />));

      expect(screen.queryByText('Try another search.')).not.toBeOnTheScreen();
    });
  });

  describe('icon', () => {
    it('renders iconNode when no icon is given', async () => {
      await render(wrap(<StatusPage title="Empty" iconNode={<RNText>custom</RNText>} />));

      expect(screen.getByText('custom', { includeHiddenElements: true })).toBeOnTheScreen();
    });

    it('hides the icon from assistive technology', async () => {
      await render(wrap(<StatusPage title="Empty" iconNode={<RNText>custom</RNText>} />));

      // The default queries skip a11y-hidden subtrees, so "only findable with
      // includeHiddenElements" is exactly the assertion we want here.
      expect(screen.queryByText('custom')).toBeNull();
    });

    it('ignores iconNode when icon is also provided', async () => {
      await render(
        wrap(<StatusPage title="Empty" icon={StarOutline} iconNode={<RNText>custom</RNText>} />),
      );

      expect(screen.queryByText('custom', { includeHiddenElements: true })).toBeNull();
    });
  });

  it('renders action children', async () => {
    await render(
      wrap(
        <StatusPage title="Empty">
          <RNText>Add a package</RNText>
        </StatusPage>,
      ),
    );

    expect(screen.getByText('Add a package')).toBeOnTheScreen();
  });

  describe('compact', () => {
    it('uses the roomy padding by default', async () => {
      await render(wrap(<StatusPage testID="page" title="Empty" />));
      const style = styleOf('page');

      expect(style.paddingVertical).toBe(48);
      expect(style.paddingHorizontal).toBe(24);
    });

    it('tightens the padding', async () => {
      await render(wrap(<StatusPage testID="page" title="Empty" compact />));
      const style = styleOf('page');

      expect(style.paddingVertical).toBe(18);
      expect(style.paddingHorizontal).toBe(18);
    });

    it('scales the title down', async () => {
      await render(
        wrap(
          <>
            <StatusPage title="Roomy" />
            <StatusPage title="Tight" compact />
          </>,
        ),
      );

      const roomy = StyleSheet.flatten(screen.getByText('Roomy').props.style).fontSize;
      const tight = StyleSheet.flatten(screen.getByText('Tight').props.style).fontSize;

      expect(tight).toBeLessThan(roomy);
    });

    it('narrows the description measure along with its font size', async () => {
      await render(
        wrap(
          <>
            <StatusPage title="Roomy" description="Roomy copy." />
            <StatusPage title="Tight" description="Tight copy." compact />
          </>,
        ),
      );

      // 36ch resolved as 0.5em: 36 × 0.5 × 16 body, 36 × 0.5 × 12 caption.
      expect(StyleSheet.flatten(screen.getByText('Roomy copy.').props.style).maxWidth).toBe(288);
      expect(StyleSheet.flatten(screen.getByText('Tight copy.').props.style).maxWidth).toBe(216);
    });
  });

  it('centres its content on both axes', async () => {
    await render(wrap(<StatusPage testID="page" title="Empty" />));
    const style = styleOf('page');

    expect(style.alignItems).toBe('center');
    expect(style.justifyContent).toBe('center');
  });

  it('merges a consumer style over its own', async () => {
    await render(wrap(<StatusPage testID="page" title="Empty" style={{ paddingVertical: 8 }} />));

    expect(styleOf('page').paddingVertical).toBe(8);
  });

  it('forwards a ref to the underlying view', async () => {
    const ref = { current: null as View | null };
    await render(wrap(<StatusPage ref={ref} title="Empty" />));

    expect(ref.current).not.toBeNull();
  });
});
