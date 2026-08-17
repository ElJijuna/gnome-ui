import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SparkBulletChart } from './SparkBulletChart';

describe('SparkBulletChart', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<SparkBulletChart value={72} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('uses 16px as the default height', () => {
      const { container } = render(<SparkBulletChart value={72} />);

      expect(container.querySelector('div')).toHaveStyle({ height: '16px' });
    });

    it('applies a custom height', () => {
      const { container } = render(<SparkBulletChart value={72} height={24} />);

      expect(container.querySelector('div')).toHaveStyle({ height: '24px' });
    });

    it('renders a single neutral band when ranges is omitted', () => {
      const { container } = render(<SparkBulletChart value={72} />);
      const wrapper = container.querySelector('div')!;

      // 1 default band + 1 performance bar
      expect(wrapper.children.length).toBe(2);
    });

    it('renders one band per range', () => {
      const { container } = render(
        <SparkBulletChart value={72} ranges={[{ value: 50 }, { value: 80 }, { value: 100 }]} />,
      );
      const wrapper = container.querySelector('div')!;

      // 3 bands + 1 performance bar
      expect(wrapper.children.length).toBe(4);
    });

    it('renders an extra element for the target tick when provided', () => {
      const { container } = render(<SparkBulletChart value={72} target={85} />);
      const wrapper = container.querySelector('div')!;

      // 1 default band + 1 performance bar + 1 target tick
      expect(wrapper.children.length).toBe(3);
    });
  });

  describe('accessibility', () => {
    it('sets role=img and aria-label when aria-label is provided', () => {
      const { container } = render(<SparkBulletChart value={72} aria-label="CPU usage" />);
      const wrapper = container.querySelector('div');

      expect(wrapper).toHaveAttribute('role', 'img');
      expect(wrapper).toHaveAttribute('aria-label', 'CPU usage');
    });

    it('sets aria-hidden when no aria-label is provided', () => {
      const { container } = render(<SparkBulletChart value={72} />);
      const wrapper = container.querySelector('div');

      expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the wrapper div', () => {
      const { container } = render(<SparkBulletChart value={72} className="spark-bullet-cls" />);

      expect(container.querySelector('div')).toHaveClass('spark-bullet-cls');
    });
  });
});
