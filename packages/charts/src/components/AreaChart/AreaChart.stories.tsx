import type { Meta, StoryObj } from '@storybook/react';

import { AreaChart } from './AreaChart';
import readme from './README.md?raw';

const meta: Meta<typeof AreaChart> = {
  title: 'Charts/AreaChart',
  component: AreaChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: readme } },
  },
  argTypes: {
    data: { control: false },
    series: { control: false },
    className: { control: false },
    height: { control: { type: 'number', min: 100, max: 800, step: 50 } },
    showGrid: { control: 'boolean' },
    stacked: { control: 'boolean' },
    gradient: { control: 'boolean' },
    showLegend: { control: 'boolean' },
    legendPosition: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      if: { arg: 'showLegend' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AreaChart>;

const TRAFFIC_DATA = [
  { week: 'W1', downloads: 320, installs: 210 },
  { week: 'W2', downloads: 480, installs: 310 },
  { week: 'W3', downloads: 410, installs: 280 },
  { week: 'W4', downloads: 620, installs: 420 },
  { week: 'W5', downloads: 590, installs: 390 },
  { week: 'W6', downloads: 780, installs: 540 },
];

export const Default: Story = {
  args: {
    data: TRAFFIC_DATA,
    series: [{ dataKey: 'downloads', name: 'Downloads' }],
    xAxisKey: 'week',
    showLegend: false,
    legendPosition: 'bottom',
  },
};

export const MultiSeries: Story = {
  args: {
    data: TRAFFIC_DATA,
    series: [
      { dataKey: 'downloads', name: 'Downloads' },
      { dataKey: 'installs', name: 'Installs' },
    ],
    xAxisKey: 'week',
    showLegend: true,
    legendPosition: 'bottom',
  },
};

export const Stacked: Story = {
  args: {
    data: TRAFFIC_DATA,
    series: [
      { dataKey: 'downloads', name: 'Downloads' },
      { dataKey: 'installs', name: 'Installs' },
    ],
    xAxisKey: 'week',
    showLegend: true,
    stacked: true,
  },
};

export const Gradient: Story = {
  args: {
    data: TRAFFIC_DATA,
    series: [
      { dataKey: 'downloads', name: 'Downloads' },
      { dataKey: 'installs', name: 'Installs' },
    ],
    xAxisKey: 'week',
    showLegend: true,
    gradient: true,
  },
};

export const GradientStacked: Story = {
  args: {
    data: TRAFFIC_DATA,
    series: [
      { dataKey: 'downloads', name: 'Downloads' },
      { dataKey: 'installs', name: 'Installs' },
    ],
    xAxisKey: 'week',
    showLegend: true,
    gradient: true,
    stacked: true,
  },
};

/**
 * 6-month daily vulnerability history dataset for a component (Jan 1, 2024 - Jun 30, 2024 = 182 daily reports).
 * Reports daily counts for severities: CRITICAL, HIGH, MEDIUM, MINIMAL, LOW, None.
 */
const VULNERABILITY_HISTORY_DATA: Record<string, unknown>[] = (() => {
  const data: Record<string, unknown>[] = [];
  const startYear = 2024;
  const startMonth = 0; // January
  const startDate = 1;
  const totalDays = 182; // 6 calendar months (Jan 1 to Jun 30, 2024)

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(Date.UTC(startYear, startMonth, startDate + i));
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const date = `${year}-${month}-${day}`;

    // Realistic vulnerability evolution across 6 months:
    // Month 1 (Jan): initial baseline with technical debt
    // Month 2 (Feb): CVE security disclosure spike & quick hotfix
    // Month 3 (Mar): remediation sprint reducing Medium and Low
    // Month 4 (Apr): routine development with minor library findings
    // Month 5 (May): transitive dependency CVE alert & patch deployment
    // Month 6 (Jun): hardened release baseline
    let critical = 0;
    let high = 2;
    let medium = 8;
    let minimal = 4;
    let low = 14;
    let none = 3;

    if (i >= 38 && i <= 50) {
      // February CVE incident window and remediation
      critical = i < 46 ? 2 : 1;
      high = 5;
      medium = 10;
    } else if (i > 50 && i <= 100) {
      // March sprint cleanup
      critical = 0;
      high = 1;
      medium = 5;
      low = 10;
    } else if (i > 100 && i <= 130) {
      // April updates
      critical = 0;
      high = 2;
      medium = 7;
      low = 12;
      minimal = 5;
    } else if (i > 130 && i <= 145) {
      // May advisory and resolution
      critical = i < 138 ? 1 : 0;
      high = 4;
      medium = 8;
    } else if (i > 145) {
      // June hardened baseline
      critical = 0;
      high = 0;
      medium = 3;
      low = 7;
      minimal = 3;
      none = 1;
    }

    // Deterministic organic variation without erratic jumps
    const jitter1 = Math.round(Math.sin(i * 0.7) * 0.8);
    const jitter2 = Math.round(Math.cos(i * 0.5) * 1.2);
    const jitter3 = Math.round(Math.sin(i * 0.3) * 0.6);
    const jitter4 = Math.round(Math.cos(i * 0.4) * 0.5);

    const criticalCount = Math.max(0, critical);
    const highCount = Math.max(0, high + jitter1);
    const mediumCount = Math.max(0, medium + jitter2);
    const minimalCount = Math.max(0, minimal + jitter3);
    const lowCount = Math.max(0, low + jitter1);
    const noneCount = Math.max(0, none + jitter4);

    data.push({
      date,
      CRITICAL: criticalCount,
      HIGH: highCount,
      MEDIUM: mediumCount,
      MINIMAL: minimalCount,
      LOW: lowCount,
      None: noneCount,
      // Lowercase aliases for convenience
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      minimal: minimalCount,
      low: lowCount,
      none: noneCount,
    });
  }

  return data;
})();

export const VulnerabilityHistory: Story = {
  name: 'Vulnerability History (6 Months)',
  parameters: {
    docs: {
      description: {
        story:
          'Component vulnerability history over 6 months with daily reports across CRITICAL, HIGH, MEDIUM, MINIMAL, LOW, and None severities.',
      },
    },
  },
  args: {
    data: VULNERABILITY_HISTORY_DATA,
    series: [
      {
        dataKey: 'CRITICAL',
        name: 'Critical',
        color: 'var(--gnome-red-3, #e01b24)',
      },
      {
        dataKey: 'HIGH',
        name: 'High',
        color: 'var(--gnome-orange-3, #ff7800)',
      },
      {
        dataKey: 'MEDIUM',
        name: 'Medium',
        color: 'var(--gnome-yellow-5, #e5a50a)',
      },
      {
        dataKey: 'MINIMAL',
        name: 'Minimal',
        color: 'var(--gnome-blue-1, #99c1f1)',
      },
      {
        dataKey: 'LOW',
        name: 'Low',
        color: 'var(--gnome-blue-3, #3584e4)',
      },
      {
        dataKey: 'None',
        name: 'None',
        color: 'var(--gnome-dark-2, #5e5c64)',
      },
    ],
    xAxisKey: 'date',
    showLegend: true,
    legendPosition: 'bottom',
    stacked: true,
    gradient: true,
    height: 350,
  },
};
