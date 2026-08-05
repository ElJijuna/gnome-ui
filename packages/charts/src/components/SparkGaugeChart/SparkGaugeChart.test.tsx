import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SparkGaugeChart } from './SparkGaugeChart';

describe('SparkGaugeChart', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<SparkGaugeChart value={72} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('uses 40px as the default size', () => {
      const { container } = render(<SparkGaugeChart value={72} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('width', '40');
      expect(svg).toHaveAttribute('height', '40');
    });

    it('applies a custom size', () => {
      const { container } = render(<SparkGaugeChart value={72} size={24} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    });

    it('renders a track circle and a value circle', () => {
      const { container } = render(<SparkGaugeChart value={72} />);

      expect(container.querySelectorAll('circle')).toHaveLength(2);
    });
  });

  describe('progress geometry', () => {
    it('gives a value at min a full dash offset (empty ring)', () => {
      const { container } = render(<SparkGaugeChart value={0} min={0} max={100} size={40} />);
      const [, valueCircle] = container.querySelectorAll('circle');
      const dasharray = parseFloat(valueCircle.getAttribute('stroke-dasharray')!);
      const dashoffset = parseFloat(valueCircle.getAttribute('stroke-dashoffset')!);

      expect(dashoffset).toBeCloseTo(dasharray, 5);
    });

    it('gives a value at max a zero dash offset (full ring)', () => {
      const { container } = render(<SparkGaugeChart value={100} min={0} max={100} size={40} />);
      const [, valueCircle] = container.querySelectorAll('circle');
      const dashoffset = parseFloat(valueCircle.getAttribute('stroke-dashoffset')!);

      expect(dashoffset).toBeCloseTo(0, 5);
    });

    it('gives a mid-range value a half dash offset', () => {
      const { container } = render(<SparkGaugeChart value={50} min={0} max={100} size={40} />);
      const [, valueCircle] = container.querySelectorAll('circle');
      const dasharray = parseFloat(valueCircle.getAttribute('stroke-dasharray')!);
      const dashoffset = parseFloat(valueCircle.getAttribute('stroke-dashoffset')!);

      expect(dashoffset).toBeCloseTo(dasharray / 2, 5);
    });

    it('clamps a value above max to a full ring', () => {
      const { container } = render(<SparkGaugeChart value={150} min={0} max={100} size={40} />);
      const [, valueCircle] = container.querySelectorAll('circle');
      const dashoffset = parseFloat(valueCircle.getAttribute('stroke-dashoffset')!);

      expect(dashoffset).toBeCloseTo(0, 5);
    });

    it('clamps a value below min to an empty ring', () => {
      const { container } = render(<SparkGaugeChart value={-20} min={0} max={100} size={40} />);
      const [, valueCircle] = container.querySelectorAll('circle');
      const dasharray = parseFloat(valueCircle.getAttribute('stroke-dasharray')!);
      const dashoffset = parseFloat(valueCircle.getAttribute('stroke-dashoffset')!);

      expect(dashoffset).toBeCloseTo(dasharray, 5);
    });
  });

  describe('color resolution', () => {
    it('uses the accent color by default', () => {
      const { container } = render(<SparkGaugeChart value={50} />);
      const [, valueCircle] = container.querySelectorAll('circle');

      expect(valueCircle).toHaveAttribute('stroke', 'var(--gnome-accent-color, #3584e4)');
    });

    it('uses an explicit color when provided', () => {
      const { container } = render(<SparkGaugeChart value={50} color="#3584e4" />);
      const [, valueCircle] = container.querySelectorAll('circle');

      expect(valueCircle).toHaveAttribute('stroke', '#3584e4');
    });

    it('resolves color from thresholds based on the current value', () => {
      const { container } = render(
        <SparkGaugeChart
          value={90}
          thresholds={[
            { value: 0, color: '#e01b24' },
            { value: 50, color: '#e5a50a' },
            { value: 80, color: '#2ec27e' },
          ]}
        />,
      );
      const [, valueCircle] = container.querySelectorAll('circle');

      expect(valueCircle).toHaveAttribute('stroke', '#2ec27e');
    });
  });

  describe('accessibility', () => {
    it('sets role=img and aria-label when aria-label is provided', () => {
      const { container } = render(<SparkGaugeChart value={72} aria-label="CPU usage" />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('role', 'img');
      expect(svg).toHaveAttribute('aria-label', 'CPU usage');
    });

    it('sets aria-hidden when no aria-label is provided', () => {
      const { container } = render(<SparkGaugeChart value={72} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the svg', () => {
      const { container } = render(<SparkGaugeChart value={72} className="spark-gauge-cls" />);

      expect(container.querySelector('svg')).toHaveClass('spark-gauge-cls');
    });
  });
});
