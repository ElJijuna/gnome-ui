import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FunnelChart } from './FunnelChart';

const DATA = [
  { name: 'Visits', value: 5000 },
  { name: 'Leads', value: 2400 },
  { name: 'Customers', value: 800 },
];

describe('FunnelChart', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<FunnelChart data={DATA} />);

      expect(container.firstChild).not.toBeNull();
    });

    it('applies custom height', () => {
      const { container } = render(<FunnelChart data={DATA} height={400} />);
      const wrapper = container.firstChild as HTMLElement;

      expect(wrapper.style.height).toBe('400px');
    });

    it('uses default height of 300', () => {
      const { container } = render(<FunnelChart data={DATA} />);
      const wrapper = container.firstChild as HTMLElement;

      expect(wrapper.style.height).toBe('300px');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      const { container } = render(<FunnelChart data={DATA} className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('accessibility', () => {
    it('has role img', () => {
      const { container } = render(<FunnelChart data={DATA} />);
      const wrapper = container.firstChild as HTMLElement;

      expect(wrapper.getAttribute('role')).toBe('img');
    });
  });
});
