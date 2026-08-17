import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BulletChart } from './BulletChart';
import styles from './BulletChart.module.css';

describe('BulletChart', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<BulletChart value={72} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('uses 32px as default track height', () => {
      const { container } = render(<BulletChart value={72} />);
      const track = container.querySelector("[role='img'] > div:last-of-type");

      expect(track).toHaveStyle({ height: '32px' });
    });

    it('applies a custom height', () => {
      const { container } = render(<BulletChart value={72} height={48} />);
      const track = container.querySelector("[role='img'] > div:last-of-type");

      expect(track).toHaveStyle({ height: '48px' });
    });

    it('renders a single neutral band when ranges is omitted', () => {
      const { container } = render(<BulletChart value={72} />);
      const track = container.querySelector("[role='img'] > div:last-of-type")!;

      // 1 default band + 1 performance bar
      expect(track.querySelectorAll(`.${styles.band}`).length).toBe(1);
    });

    it('renders one band per range', () => {
      const { container } = render(
        <BulletChart value={72} ranges={[{ value: 50 }, { value: 80 }, { value: 100 }]} />,
      );
      const track = container.querySelector("[role='img'] > div:last-of-type")!;

      expect(track.querySelectorAll(`.${styles.band}`).length).toBe(3);
    });

    it('does not render a target tick by default', () => {
      const { container } = render(<BulletChart value={72} />);
      const track = container.querySelector("[role='img'] > div:last-of-type")!;

      // 1 default band + 1 performance bar, no target tick
      expect(track.children.length).toBe(2);
    });

    it('renders a target tick when target is provided', () => {
      const { container } = render(<BulletChart value={72} target={85} />);
      const track = container.querySelector("[role='img'] > div:last-of-type")!;

      // 1 default band + 1 performance bar + 1 target tick
      expect(track.children.length).toBe(3);
    });
  });

  describe('label and value', () => {
    it('renders the label when provided', () => {
      const { getByText } = render(<BulletChart value={72} label="Revenue" />);

      expect(getByText('Revenue')).toBeInTheDocument();
    });

    it('shows the formatted value by default', () => {
      const { getByText } = render(<BulletChart value={72} />);

      expect(getByText('72')).toBeInTheDocument();
    });

    it('hides the value when showValue is false', () => {
      const { queryByText } = render(<BulletChart value={72} showValue={false} />);

      expect(queryByText('72')).not.toBeInTheDocument();
    });

    it('shows the target alongside the value', () => {
      const { container } = render(<BulletChart value={72} target={85} />);
      const value = container.querySelector(`.${styles.value}`);

      expect(value).toHaveTextContent('72 / 85');
    });

    it('uses a custom valueFormatter', () => {
      const { getByText } = render(<BulletChart value={72} valueFormatter={(v) => `${v}%`} />);

      expect(getByText('72%')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has role=img on the wrapper', () => {
      const { container } = render(<BulletChart value={72} />);

      expect(container.querySelector("[role='img']")).toBeInTheDocument();
    });

    it('generates an aria-label including label, value, and target', () => {
      const { container } = render(<BulletChart value={72} target={85} label="CPU" />);

      const el = container.querySelector("[role='img']");
      expect(el).toHaveAttribute('aria-label', expect.stringContaining('CPU'));
      expect(el).toHaveAttribute('aria-label', expect.stringContaining('72'));
      expect(el).toHaveAttribute('aria-label', expect.stringContaining('85'));
    });

    it('uses the custom aria-label when provided', () => {
      const { container } = render(<BulletChart value={72} aria-label="Current CPU load" />);

      expect(container.querySelector("[role='img']")).toHaveAttribute(
        'aria-label',
        'Current CPU load',
      );
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the wrapper div', () => {
      const { container } = render(<BulletChart value={72} className="bullet-cls" />);

      expect(container.querySelector("[role='img']")).toHaveClass('bullet-cls');
    });
  });
});
