import { fireEvent, render, screen } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { SegmentedBar } from './SegmentedBar';

const defaultValues = [
  { label: 'TypeScript', value: 60 },
  { label: 'JavaScript', value: 30 },
  { label: 'CSS', value: 10 },
];

describe('SegmentedBar', () => {
  describe('rendering', () => {
    it('renders with role img', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <SegmentedBar values={defaultValues} />
        </GnomeProvider>,
      );

      expect(screen.getByRole('img')).toBeOnTheScreen();
    });

    it('auto-generates the accessibility label from values', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <SegmentedBar values={defaultValues} />
        </GnomeProvider>,
      );

      expect(screen.getByRole('img').props.accessibilityLabel).toBe(
        'TypeScript 60%, JavaScript 30%, CSS 10%',
      );
    });

    it('uses a custom accessibilityLabel when provided', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <SegmentedBar values={defaultValues} accessibilityLabel="Language breakdown" />
        </GnomeProvider>,
      );

      expect(screen.getByRole('img').props.accessibilityLabel).toBe('Language breakdown');
    });

    it('renders one segment per value', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <SegmentedBar values={defaultValues} />
        </GnomeProvider>,
      );

      expect(screen.getAllByTestId('segmented-bar-segment')).toHaveLength(3);
    });
  });

  describe('proportional widths', () => {
    it('sets segment widths as a percentage of the total', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <SegmentedBar
            values={[
              { label: 'A', value: 75 },
              { label: 'B', value: 25 },
            ]}
          />
        </GnomeProvider>,
      );

      const segments = screen.getAllByTestId('segmented-bar-segment');

      expect(segments[0]).toHaveStyle({ width: '75%' });
      expect(segments[1]).toHaveStyle({ width: '25%' });
    });

    it('normalizes proportionally when values do not sum to 100', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <SegmentedBar
            values={[
              { label: 'A', value: 1 },
              { label: 'B', value: 3 },
            ]}
          />
        </GnomeProvider>,
      );

      const segments = screen.getAllByTestId('segmented-bar-segment');

      expect(segments[0]).toHaveStyle({ width: '25%' });
      expect(segments[1]).toHaveStyle({ width: '75%' });
    });
  });

  describe('custom color', () => {
    it('applies a custom color as the segment background', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <SegmentedBar values={[{ label: 'Go', value: 100, color: '#00add8' }]} />
        </GnomeProvider>,
      );

      expect(screen.getByTestId('segmented-bar-segment')).toHaveStyle({
        backgroundColor: '#00add8',
      });
    });

    it('falls back to the cycling palette when no color is provided', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <SegmentedBar values={[{ label: 'Go', value: 100 }]} />
        </GnomeProvider>,
      );

      expect(screen.getByTestId('segmented-bar-segment').props.style.backgroundColor).not.toBe(
        undefined,
      );
    });
  });

  describe('touch interaction', () => {
    it('dims every other segment while one is pressed', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <SegmentedBar values={defaultValues} />
        </GnomeProvider>,
      );

      const segments = screen.getAllByTestId('segmented-bar-segment');

      await fireEvent(segments[0], 'pressIn');

      expect(segments[0]).toHaveStyle({ opacity: 1 });
      expect(segments[1]).toHaveStyle({ opacity: 0.35 });
      expect(segments[2]).toHaveStyle({ opacity: 0.35 });
    });

    it('clears the dim on release', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <SegmentedBar values={defaultValues} />
        </GnomeProvider>,
      );

      const segments = screen.getAllByTestId('segmented-bar-segment');

      await fireEvent(segments[0], 'pressIn');
      await fireEvent(segments[0], 'pressOut');

      segments.forEach((s) => {
        expect(s).toHaveStyle({ opacity: 1 });
      });
    });
  });
});
