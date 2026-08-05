import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Heatmap } from './Heatmap';

const DATA = [
  { row: 'Mon', column: 'AM', value: 10 },
  { row: 'Mon', column: 'PM', value: 40 },
  { row: 'Tue', column: 'AM', value: 70 },
  { row: 'Tue', column: 'PM', value: 20 },
];

describe('Heatmap', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<Heatmap data={DATA} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a cell for every row/column combination', () => {
      const { container } = render(<Heatmap data={DATA} />);

      expect(container.querySelectorAll('[title]').length).toBeGreaterThanOrEqual(DATA.length + 2);
    });

    it('renders row labels', () => {
      const { getByTitle } = render(<Heatmap data={DATA} />);

      expect(getByTitle('Mon')).toBeInTheDocument();
      expect(getByTitle('Tue')).toBeInTheDocument();
    });

    it('renders column labels', () => {
      const { getByTitle } = render(<Heatmap data={DATA} />);

      expect(getByTitle('AM')).toBeInTheDocument();
      expect(getByTitle('PM')).toBeInTheDocument();
    });

    it('uses explicit row/column order when provided', () => {
      const { container } = render(
        <Heatmap data={DATA} rows={['Tue', 'Mon']} columns={['PM', 'AM']} />,
      );
      const labels = Array.from(container.querySelectorAll('[title="Tue"], [title="Mon"]')).map(
        (el) => el.textContent,
      );

      expect(labels).toEqual(['Tue', 'Mon']);
    });

    it('applies cellSize to grid cells', () => {
      const { container } = render(<Heatmap data={DATA} cellSize={60} />);
      const cell = container.querySelector('[title="Mon, AM: 10"]');

      expect(cell).toHaveStyle({ width: '60px', height: '60px' });
    });
  });

  describe('missing data', () => {
    it('renders a neutral cell and labels it as no data', () => {
      const { getByTitle } = render(
        <Heatmap data={[{ row: 'A', column: 'X', value: 5 }]} rows={['A', 'B']} columns={['X']} />,
      );

      expect(getByTitle('B, X: no data')).toBeInTheDocument();
    });
  });

  describe('value labels', () => {
    it('hides values by default', () => {
      const { queryByText } = render(<Heatmap data={DATA} />);

      expect(queryByText('10')).not.toBeInTheDocument();
    });

    it('shows formatted values when showValues is true', () => {
      const { getByText } = render(<Heatmap data={DATA} showValues />);

      expect(getByText('10')).toBeInTheDocument();
      expect(getByText('70')).toBeInTheDocument();
    });

    it('uses a custom valueFormatter', () => {
      const { getByText } = render(
        <Heatmap data={DATA} showValues valueFormatter={(v) => `${v}%`} />,
      );

      expect(getByText('10%')).toBeInTheDocument();
    });
  });

  describe('legend', () => {
    it('does not render a legend ramp by default', () => {
      const { container } = render(<Heatmap data={DATA} />);

      expect(container.querySelector('[style*="linear-gradient"]')).not.toBeInTheDocument();
    });

    it('renders a legend ramp and min/max labels when showLegend is true', () => {
      const { container, getByText } = render(<Heatmap data={DATA} showLegend />);

      expect(container.querySelector('[style*="linear-gradient"]')).toBeInTheDocument();
      expect(getByText('10')).toBeInTheDocument();
      expect(getByText('70')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has role=img on the wrapper', () => {
      const { container } = render(<Heatmap data={DATA} />);

      expect(container.querySelector("[role='img']")).toBeInTheDocument();
    });

    it('generates a default aria-label with row/column counts', () => {
      const { container } = render(<Heatmap data={DATA} />);

      expect(container.querySelector("[role='img']")).toHaveAttribute(
        'aria-label',
        'Heatmap: 2 rows by 2 columns',
      );
    });

    it('uses the custom aria-label when provided', () => {
      const { container } = render(<Heatmap data={DATA} aria-label="Weekly activity" />);

      expect(container.querySelector("[role='img']")).toHaveAttribute(
        'aria-label',
        'Weekly activity',
      );
    });

    it('labels each cell with row, column, and value', () => {
      const { getByTitle } = render(<Heatmap data={DATA} />);

      expect(getByTitle('Mon, AM: 10')).toBeInTheDocument();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the wrapper div', () => {
      const { container } = render(<Heatmap data={DATA} className="heatmap-cls" />);

      expect(container.querySelector("[role='img']")).toHaveClass('heatmap-cls');
    });
  });
});
