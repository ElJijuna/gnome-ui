import { render, screen } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { lightTheme } from '@/theme';
import { LevelBar } from './LevelBar';

describe('LevelBar', () => {
  describe('value / range', () => {
    it('renders as a meter with min/max/now via accessibilityValue', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <LevelBar value={0.6} accessibilityLabel="Disk usage" />
        </GnomeProvider>,
      );

      const meter = screen.getByRole('meter', { name: 'Disk usage' });

      expect(meter.props.accessibilityValue).toEqual({ min: 0, max: 1, now: 0.6 });
    });

    it('supports a custom min/max range', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <LevelBar value={50} min={0} max={200} accessibilityLabel="Level" />
        </GnomeProvider>,
      );

      expect(screen.getByRole('meter', { name: 'Level' }).props.accessibilityValue).toEqual({
        min: 0,
        max: 200,
        now: 50,
      });
    });

    it('clamps a value above max', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <LevelBar value={1.5} accessibilityLabel="Level" />
        </GnomeProvider>,
      );

      expect(screen.getByRole('meter', { name: 'Level' }).props.accessibilityValue.now).toBe(1);
    });

    it('clamps a value below min', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <LevelBar value={-0.5} accessibilityLabel="Level" />
        </GnomeProvider>,
      );

      expect(screen.getByRole('meter', { name: 'Level' }).props.accessibilityValue.now).toBe(0);
    });
  });

  describe('low/high offset zones', () => {
    it('defaults to the accent variant between low and high', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <LevelBar value={0.5} low={0.25} high={0.75} accessibilityLabel="Level" testID="bar" />
        </GnomeProvider>,
      );

      expect(screen.getByTestId('bar-fill')).toHaveStyle({
        backgroundColor: lightTheme.accentBgColor,
      });
    });

    it('applies the warning (low) variant at or below the low threshold', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <LevelBar value={0.2} low={0.25} accessibilityLabel="Level" testID="bar" />
        </GnomeProvider>,
      );

      expect(screen.getByTestId('bar-fill')).toHaveStyle({
        backgroundColor: lightTheme.warningBgColor,
      });
    });

    it('applies the error (high) variant at or above the high threshold', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <LevelBar value={0.8} high={0.75} accessibilityLabel="Level" testID="bar" />
        </GnomeProvider>,
      );

      expect(screen.getByTestId('bar-fill')).toHaveStyle({
        backgroundColor: lightTheme.errorBgColor,
      });
    });

    it('accepts custom lowVariant/highVariant colors', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <LevelBar
            value={0.9}
            high={0.75}
            highVariant="success"
            accessibilityLabel="Level"
            testID="bar"
          />
        </GnomeProvider>,
      );

      expect(screen.getByTestId('bar-fill')).toHaveStyle({
        backgroundColor: lightTheme.successBgColor,
      });
    });

    it('does not apply low/high zones when the thresholds are omitted', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <LevelBar value={0.01} accessibilityLabel="Level" testID="bar" />
        </GnomeProvider>,
      );

      expect(screen.getByTestId('bar-fill')).toHaveStyle({
        backgroundColor: lightTheme.accentBgColor,
      });
    });
  });

  describe('discrete mode', () => {
    it('renders numBlocks blocks instead of a continuous fill', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <LevelBar value={0.5} discrete numBlocks={5} accessibilityLabel="Signal" testID="bar" />
        </GnomeProvider>,
      );

      expect(
        screen.getAllByTestId('level-bar-block', { includeHiddenElements: true }),
      ).toHaveLength(5);
      expect(screen.queryByTestId('bar-fill')).not.toBeOnTheScreen();
    });

    it('fills the correct number of blocks for the current value', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <LevelBar value={0.5} discrete numBlocks={10} accessibilityLabel="Signal" />
        </GnomeProvider>,
      );

      const blocks = screen.getAllByTestId('level-bar-block', { includeHiddenElements: true });
      const filled = blocks.filter(
        (b) => b.props.style.backgroundColor === lightTheme.accentBgColor,
      );

      expect(filled).toHaveLength(5);
    });

    it('defaults numBlocks to 10', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <LevelBar value={0.5} discrete accessibilityLabel="Signal" />
        </GnomeProvider>,
      );

      expect(
        screen.getAllByTestId('level-bar-block', { includeHiddenElements: true }),
      ).toHaveLength(10);
    });
  });
});
