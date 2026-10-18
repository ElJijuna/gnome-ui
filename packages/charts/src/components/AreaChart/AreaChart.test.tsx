import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AreaChart } from './AreaChart';

const DATA = [
  { week: 'W1', downloads: 320, installs: 210 },
  { week: 'W2', downloads: 480, installs: 310 },
];
const SERIES = [{ dataKey: 'downloads', name: 'Downloads' }];

describe('AreaChart', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<AreaChart data={DATA} series={SERIES} xAxisKey="week" />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('applies height to the wrapper div', () => {
      const { container } = render(<AreaChart data={DATA} series={SERIES} height={350} />);

      expect(container.querySelector('div')).toHaveStyle({ height: '350px' });
    });

    it('uses 300px as default height', () => {
      const { container } = render(<AreaChart data={DATA} series={SERIES} />);

      expect(container.querySelector('div')).toHaveStyle({ height: '300px' });
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the wrapper div', () => {
      const { container } = render(
        <AreaChart data={DATA} series={SERIES} className="area-custom" />,
      );

      expect(container.querySelector('div')).toHaveClass('area-custom');
    });
  });

  describe('stacked', () => {
    it('renders without crashing when stacked', () => {
      const { container } = render(
        <AreaChart
          data={DATA}
          series={[
            { dataKey: 'downloads', name: 'Downloads' },
            { dataKey: 'installs', name: 'Installs' },
          ]}
          xAxisKey="week"
          stacked
          showLegend
        />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('gradient', () => {
    it('renders without crashing when gradient is enabled', () => {
      const { container } = render(<AreaChart data={DATA} series={SERIES} gradient />);

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has role=img on the wrapper', () => {
      const { container } = render(<AreaChart data={DATA} series={SERIES} />);

      expect(container.querySelector("[role='img']")).toBeInTheDocument();
    });

    it('generates an aria-label that includes each series name', () => {
      const { container } = render(
        <AreaChart
          data={DATA}
          series={[
            { dataKey: 'downloads', name: 'Downloads' },
            { dataKey: 'installs', name: 'Installs' },
          ]}
        />,
      );

      const el = container.querySelector("[role='img']");

      expect(el).toHaveAttribute('aria-label', expect.stringContaining('Downloads'));
      expect(el).toHaveAttribute('aria-label', expect.stringContaining('Installs'));
    });

    it('falls back to dataKey in aria-label when name is omitted', () => {
      const { container } = render(<AreaChart data={DATA} series={[{ dataKey: 'downloads' }]} />);

      expect(container.querySelector("[role='img']")).toHaveAttribute(
        'aria-label',
        expect.stringContaining('downloads'),
      );
    });

    it('uses the custom aria-label when provided', () => {
      const { container } = render(
        <AreaChart data={DATA} series={SERIES} aria-label="Weekly downloads" />,
      );

      expect(container.querySelector("[role='img']")).toHaveAttribute(
        'aria-label',
        'Weekly downloads',
      );
    });
  });

  describe('vulnerability history story data', () => {
    it('provides 182 daily entries covering 6 full calendar months', async () => {
      const { VulnerabilityHistory } = await import('./AreaChart.stories');
      const data = VulnerabilityHistory.args?.data as Record<string, unknown>[];

      expect(data).toHaveLength(182);
      expect(data[0]).toMatchObject({
        date: '2024-01-01',
      });
      expect(data[181]).toMatchObject({
        date: '2024-06-30',
      });

      // Verify all requested severities exist on daily entries
      const [firstDay] = data;
      expect(firstDay).toHaveProperty('CRITICAL');
      expect(firstDay).toHaveProperty('HIGH');
      expect(firstDay).toHaveProperty('MEDIUM');
      expect(firstDay).toHaveProperty('MINIMAL');
      expect(firstDay).toHaveProperty('LOW');
      expect(firstDay).toHaveProperty('None');

      // Verify story series includes all severities
      const seriesKeys = VulnerabilityHistory.args?.series?.map((s) => s.dataKey);
      expect(seriesKeys).toEqual(['CRITICAL', 'HIGH', 'MEDIUM', 'MINIMAL', 'LOW', 'None']);
    });

    it('renders 6 months of daily vulnerability data without crashing', async () => {
      const { VulnerabilityHistory } = await import('./AreaChart.stories');

      const { container } = render(
        <AreaChart
          data={VulnerabilityHistory.args?.data as Record<string, unknown>[]}
          series={VulnerabilityHistory.args?.series ?? []}
          xAxisKey={VulnerabilityHistory.args?.xAxisKey}
          stacked={VulnerabilityHistory.args?.stacked}
          gradient={VulnerabilityHistory.args?.gradient}
          showLegend={VulnerabilityHistory.args?.showLegend}
        />,
      );

      expect(container.firstChild).toBeInTheDocument();
      expect(container.querySelector("[role='img']")).toBeInTheDocument();
    });
  });
});
