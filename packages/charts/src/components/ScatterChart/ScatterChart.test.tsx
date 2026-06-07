import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ScatterChart } from './ScatterChart';

const SERIES = [
  {
    name: 'Group A',
    data: [
      { x: 10, y: 30 },
      { x: 40, y: 80 },
    ],
  },
];

describe('ScatterChart', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<ScatterChart series={SERIES} />);

      expect(container.firstChild).not.toBeNull();
    });

    it('applies custom height', () => {
      const { container } = render(<ScatterChart series={SERIES} height={400} />);
      const wrapper = container.firstChild as HTMLElement;

      expect(wrapper.style.height).toBe('400px');
    });

    it('uses default height of 300', () => {
      const { container } = render(<ScatterChart series={SERIES} />);
      const wrapper = container.firstChild as HTMLElement;

      expect(wrapper.style.height).toBe('300px');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      const { container } = render(<ScatterChart series={SERIES} className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('accessibility', () => {
    it('has role img', () => {
      const { container } = render(<ScatterChart series={SERIES} />);
      const wrapper = container.firstChild as HTMLElement;

      expect(wrapper.getAttribute('role')).toBe('img');
    });
  });

  describe('multi-series', () => {
    it('renders multiple series', () => {
      const { container } = render(
        <ScatterChart
          series={[
            { name: 'A', data: [{ x: 1, y: 2 }] },
            { name: 'B', data: [{ x: 3, y: 4 }] },
          ]}
        />,
      );

      expect(container.firstChild).not.toBeNull();
    });
  });
});
