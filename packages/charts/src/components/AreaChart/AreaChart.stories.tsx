import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { AreaChart, type AreaChartPointClickEvent } from './AreaChart';
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
    onPointClick: { action: 'pointClicked' },
    onSelect: { action: 'selected' },
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
          'Component vulnerability history over 6 months with daily reports across CRITICAL, HIGH, MEDIUM, MINIMAL, LOW, and None severities. Click on any point/day in the chart to select it and emit an event with the daily findings.',
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
  render: function VulnerabilityHistoryInteractive(args) {
    const [selectedEvent, setSelectedEvent] = useState<AreaChartPointClickEvent | null>(() => {
      // Default to day 45 (the CVE disclosure incident) so initial info is visible
      const initialIndex = 45;
      const sampleItem = args.data[initialIndex];
      return sampleItem
        ? {
            data: sampleItem,
            index: initialIndex,
            label: String(sampleItem.date ?? '2024-02-15'),
          }
        : null;
    });

    const handlePointClick = (event: AreaChartPointClickEvent) => {
      setSelectedEvent(event);
      args.onPointClick?.(event);
    };

    const d = selectedEvent?.data;
    const total = d
      ? Number(d.CRITICAL ?? 0) +
        Number(d.HIGH ?? 0) +
        Number(d.MEDIUM ?? 0) +
        Number(d.MINIMAL ?? 0) +
        Number(d.LOW ?? 0) +
        Number(d.None ?? 0)
      : 0;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <AreaChart {...args} selectedPoint={selectedEvent?.label} onPointClick={handlePointClick} />

        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--gnome-card-bg, rgba(0, 0, 0, 0.04))',
            borderRadius: '12px',
            border: '1px solid var(--gnome-border-subtle, rgba(0, 0, 0, 0.1))',
            fontFamily: 'var(--gnome-font-family, system-ui)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div>
              <strong style={{ fontSize: 14 }}>
                {selectedEvent ? `📅 Reporte del día: ${selectedEvent.label}` : 'Selecciona un día'}
              </strong>
              <span
                style={{
                  marginLeft: 12,
                  fontSize: 12,
                  color: 'var(--gnome-window-fg-color, rgba(0, 0, 0, 0.6))',
                }}
              >
                (Índice día: {selectedEvent ? selectedEvent.index + 1 : '—'} / 182)
              </span>
            </div>
            {selectedEvent && (
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color:
                    total > 0 ? 'var(--gnome-red-3, #e01b24)' : 'var(--gnome-green-4, #2ec27e)',
                }}
              >
                Total: {total} vulnerabilidades
              </span>
            )}
          </div>

          {selectedEvent && d ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 9999,
                  backgroundColor: 'var(--gnome-red-3, #e01b24)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                CRITICAL: {String(d.CRITICAL ?? 0)}
              </span>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 9999,
                  backgroundColor: 'var(--gnome-orange-3, #ff7800)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                HIGH: {String(d.HIGH ?? 0)}
              </span>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 9999,
                  backgroundColor: 'var(--gnome-yellow-5, #e5a50a)',
                  color: '#000',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                MEDIUM: {String(d.MEDIUM ?? 0)}
              </span>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 9999,
                  backgroundColor: 'var(--gnome-blue-1, #99c1f1)',
                  color: '#000',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                MINIMAL: {String(d.MINIMAL ?? 0)}
              </span>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 9999,
                  backgroundColor: 'var(--gnome-blue-3, #3584e4)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                LOW: {String(d.LOW ?? 0)}
              </span>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 9999,
                  backgroundColor: 'var(--gnome-dark-2, #5e5c64)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                None: {String(d.None ?? 0)}
              </span>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>
              Haz clic en cualquier punto del gráfico para ver el reporte emitido.
            </p>
          )}
        </div>
      </div>
    );
  },
};
