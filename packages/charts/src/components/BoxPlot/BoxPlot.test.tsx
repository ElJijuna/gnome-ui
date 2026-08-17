import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BoxPlot } from './BoxPlot';
import styles from './BoxPlot.module.css';

const VALUES_DATA = [
  { label: 'Team A', values: [12, 15, 14, 18, 22, 9, 31, 16] },
  { label: 'Team B', values: [8, 11, 10, 9, 14, 7, 12] },
];

const STATS_DATA = [
  { label: 'Team A', min: 9, q1: 13, median: 15.5, q3: 19, max: 22, outliers: [31] },
  { label: 'Team B', min: 7, q1: 8.5, median: 10, q3: 11.5, max: 14 },
];

describe('BoxPlot', () => {
  describe('rendering', () => {
    it('renders without crashing with values arrays', () => {
      const { container } = render(<BoxPlot data={VALUES_DATA} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders without crashing with precomputed stats', () => {
      const { container } = render(<BoxPlot data={STATS_DATA} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders one column per data item', () => {
      const { container } = render(<BoxPlot data={VALUES_DATA} />);

      expect(container.querySelectorAll(`.${styles.column}`).length).toBe(VALUES_DATA.length);
    });

    it('renders category labels', () => {
      const { getByText } = render(<BoxPlot data={VALUES_DATA} />);

      expect(getByText('Team A')).toBeInTheDocument();
      expect(getByText('Team B')).toBeInTheDocument();
    });

    it('applies height to the wrapper', () => {
      const { container } = render(<BoxPlot data={VALUES_DATA} height={480} />);

      expect(container.querySelector("[role='img']")).toHaveStyle({ height: '480px' });
    });

    it('uses 320px as default height', () => {
      const { container } = render(<BoxPlot data={VALUES_DATA} />);

      expect(container.querySelector("[role='img']")).toHaveStyle({ height: '320px' });
    });
  });

  describe('quartile computation', () => {
    it('computes an outlier from a values array using the 1.5*IQR rule', () => {
      const { container } = render(<BoxPlot data={[VALUES_DATA[0]]} />);

      expect(container.querySelectorAll(`.${styles.outlier}`).length).toBe(1);
    });

    it('renders no outliers for a tight values array', () => {
      const { container } = render(
        <BoxPlot data={[{ label: 'Tight', values: [10, 11, 10, 12, 11, 10, 11] }]} />,
      );

      expect(container.querySelectorAll(`.${styles.outlier}`).length).toBe(0);
    });

    it('uses precomputed outliers as-is without recomputing them', () => {
      const { container } = render(<BoxPlot data={[STATS_DATA[0]]} />);

      expect(container.querySelectorAll(`.${styles.outlier}`).length).toBe(1);
    });
  });

  describe('outliers visibility', () => {
    it('hides outliers when showOutliers is false', () => {
      const { container } = render(<BoxPlot data={STATS_DATA} showOutliers={false} />);

      expect(container.querySelectorAll(`.${styles.outlier}`).length).toBe(0);
    });
  });

  describe('colors', () => {
    it('falls back to the palette by index when color is omitted', () => {
      const { container } = render(<BoxPlot data={STATS_DATA} />);
      const boxes = container.querySelectorAll(`.${styles.box}`);

      expect(boxes[0]).not.toHaveStyle({ borderColor: (boxes[1] as HTMLElement).style.borderColor });
    });

    it('uses an explicit per-item color', () => {
      const { container } = render(
        <BoxPlot data={[{ ...STATS_DATA[0], color: '#e01b24' }]} />,
      );
      const box = container.querySelector(`.${styles.box}`);

      expect(box).toHaveStyle({ borderColor: '#e01b24' });
    });
  });

  describe('accessibility', () => {
    it('has role=img on the wrapper', () => {
      const { container } = render(<BoxPlot data={VALUES_DATA} />);

      expect(container.querySelector("[role='img']")).toBeInTheDocument();
    });

    it('generates an aria-label including each label and median', () => {
      const { container } = render(<BoxPlot data={STATS_DATA} />);
      const el = container.querySelector("[role='img']");

      expect(el).toHaveAttribute('aria-label', expect.stringContaining('Team A'));
      expect(el).toHaveAttribute('aria-label', expect.stringContaining('15.5'));
    });

    it('uses the custom aria-label when provided', () => {
      const { container } = render(<BoxPlot data={VALUES_DATA} aria-label="Response times" />);

      expect(container.querySelector("[role='img']")).toHaveAttribute(
        'aria-label',
        'Response times',
      );
    });

    it('labels each track with a summary title', () => {
      const { container } = render(<BoxPlot data={STATS_DATA} />);
      const track = container.querySelector(`.${styles.track}`);

      expect(track).toHaveAttribute('title', expect.stringContaining('Team A'));
      expect(track).toHaveAttribute('title', expect.stringContaining('median 15.5'));
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the wrapper div', () => {
      const { container } = render(<BoxPlot data={VALUES_DATA} className="boxplot-cls" />);

      expect(container.querySelector("[role='img']")).toHaveClass('boxplot-cls');
    });
  });
});
