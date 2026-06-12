import { Card, Text } from '@gnome-ui/react';
import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';

import { GNOME_CHART_PALETTE } from './colors';
import { SparkAreaChart, type SparkAreaChartProps } from './components/SparkAreaChart';
import { SparkBarChart, type SparkBarChartProps } from './components/SparkBarChart';
import { SparkLineChart, type SparkLineChartProps } from './components/SparkLineChart';
import readme from './README.md?raw';

// ─── Sample data ─────────────────────────────────────────────────────────────

const NUMBERS = [42, 58, 35, 72, 61, 88, 54, 93, 70, 85];

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Charts/Spark',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: readme } },
  },
};

export default meta;

// ─── SparkAreaChart ───────────────────────────────────────────────────────────

export const Area: StoryObj<SparkAreaChartProps> = {
  name: 'SparkAreaChart',
  args: {
    data: NUMBERS,
    height: 48,
    highlighted: true,
    gradient: true,
    fillOpacity: 0.8,
    strokeWidth: 2.5,
    color: 'var(--gnome-accent-color, #3584e4)',
  },
  argTypes: {
    highlighted: {
      control: 'boolean',
      description: 'Intensify fill (70 % → 10 %) and stroke (+0.5 px).',
    },
    gradient: { control: 'boolean', description: 'Render a top-to-bottom gradient fill.' },
    fillOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Fill opacity when `gradient` is false.',
    },
    strokeWidth: {
      control: { type: 'range', min: 0.5, max: 4, step: 0.5 },
      description: 'Line stroke width in px.',
    },
    height: {
      control: { type: 'range', min: 20, max: 120, step: 4 },
      description: 'Chart height in px.',
    },
    color: { control: 'color', description: 'Stroke and fill colour.' },
    data: { table: { disable: true } },
    dataKey: { table: { disable: true } },
    className: { table: { disable: true } },
    'aria-label': { table: { disable: true } },
  },
  render: (args) => (
    <div style={{ width: 240 }}>
      <SparkAreaChart {...args} aria-label="Weekly trend" />
    </div>
  ),
};

// ─── SparkLineChart ───────────────────────────────────────────────────────────

export const Line: StoryObj<SparkLineChartProps> = {
  name: 'SparkLineChart',
  args: {
    data: NUMBERS,
    height: 48,
    highlighted: false,
    strokeWidth: 1.5,
    color: 'var(--gnome-accent-color, #3584e4)',
  },
  argTypes: {
    highlighted: { control: 'boolean', description: 'Add a gradient area fill beneath the line.' },
    strokeWidth: {
      control: { type: 'range', min: 0.5, max: 4, step: 0.5 },
      description: 'Line stroke width in px.',
    },
    height: {
      control: { type: 'range', min: 20, max: 120, step: 4 },
      description: 'Chart height in px.',
    },
    color: { control: 'color', description: 'Stroke colour.' },
    data: { table: { disable: true } },
    dataKey: { table: { disable: true } },
    className: { table: { disable: true } },
    'aria-label': { table: { disable: true } },
  },
  render: (args) => (
    <div style={{ width: 240 }}>
      <SparkLineChart {...args} aria-label="Weekly trend" />
    </div>
  ),
};

// ─── SparkBarChart ────────────────────────────────────────────────────────────

export const Bar: StoryObj<SparkBarChartProps> = {
  name: 'SparkBarChart',
  args: {
    data: NUMBERS,
    height: 48,
    highlighted: false,
    fillOpacity: 0.85,
    color: 'var(--gnome-accent-color, #3584e4)',
  },
  argTypes: {
    highlighted: {
      control: 'boolean',
      description: 'Render bars at full opacity (1.0), overriding `fillOpacity`.',
    },
    fillOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Bar fill opacity (ignored when `highlighted`).',
    },
    barSize: {
      control: { type: 'range', min: 2, max: 20, step: 1 },
      description: 'Bar width in px. Auto-sized when omitted.',
    },
    height: {
      control: { type: 'range', min: 20, max: 120, step: 4 },
      description: 'Chart height in px.',
    },
    color: { control: 'color', description: 'Bar fill colour.' },
    data: { table: { disable: true } },
    dataKey: { table: { disable: true } },
    className: { table: { disable: true } },
    'aria-label': { table: { disable: true } },
  },
  render: (args) => (
    <div style={{ width: 240 }}>
      <SparkBarChart {...args} aria-label="Weekly trend" />
    </div>
  ),
};

// ─── Multi-series ─────────────────────────────────────────────────────────────

const MULTI_DATA = [
  { sent: 42, received: 18 },
  { sent: 58, received: 30 },
  { sent: 35, received: 22 },
  { sent: 72, received: 45 },
  { sent: 61, received: 38 },
  { sent: 88, received: 55 },
  { sent: 54, received: 32 },
  { sent: 93, received: 60 },
  { sent: 70, received: 44 },
  { sent: 85, received: 52 },
];

export const AreaMultiSeries: StoryObj<SparkAreaChartProps> = {
  name: 'SparkAreaChart — multi-series',
  args: {
    height: 48,
    highlighted: false,
    gradient: true,
    fillOpacity: 0.2,
    strokeWidth: 1.5,
  },
  argTypes: {
    highlighted: { control: 'boolean', description: 'Enable hover-based fill emphasis.' },
    gradient: { control: 'boolean', description: 'Render gradient fill.' },
    fillOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Fill opacity when `gradient` is false.',
    },
    strokeWidth: {
      control: { type: 'range', min: 0.5, max: 4, step: 0.5 },
      description: 'Stroke width in px.',
    },
    height: {
      control: { type: 'range', min: 20, max: 120, step: 4 },
      description: 'Chart height in px.',
    },
    data: { table: { disable: true } },
    series: { table: { disable: true } },
    color: { table: { disable: true } },
    dataKey: { table: { disable: true } },
    className: { table: { disable: true } },
    'aria-label': { table: { disable: true } },
  },
  render: (args) => (
    <div style={{ width: 240 }}>
      <SparkAreaChart
        {...args}
        data={MULTI_DATA}
        series={[{ key: 'sent' }, { key: 'received' }]}
        aria-label="Sent vs received"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Pass `series` with multiple keys to overlay areas. Colors fall back to `GNOME_CHART_PALETTE`.',
      },
    },
  },
};

export const LineMultiSeries: StoryObj<SparkLineChartProps> = {
  name: 'SparkLineChart — multi-series',
  args: {
    height: 48,
    highlighted: false,
    strokeWidth: 1.5,
  },
  argTypes: {
    highlighted: {
      control: 'boolean',
      description: 'Enable hover-based area fill beneath each line.',
    },
    strokeWidth: {
      control: { type: 'range', min: 0.5, max: 4, step: 0.5 },
      description: 'Stroke width in px.',
    },
    height: {
      control: { type: 'range', min: 20, max: 120, step: 4 },
      description: 'Chart height in px.',
    },
    data: { table: { disable: true } },
    series: { table: { disable: true } },
    color: { table: { disable: true } },
    dataKey: { table: { disable: true } },
    className: { table: { disable: true } },
    'aria-label': { table: { disable: true } },
  },
  render: (args) => (
    <div style={{ width: 240 }}>
      <SparkLineChart
        {...args}
        data={MULTI_DATA}
        series={[{ key: 'sent' }, { key: 'received' }]}
        aria-label="Sent vs received"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Pass `series` to render multiple lines. With `highlighted`, each line gets its own area fill on hover.',
      },
    },
  },
};

// ─── Palette colors ───────────────────────────────────────────────────────────

export const AllColors: StoryObj = {
  name: 'Palette colors',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 240 }}>
      {GNOME_CHART_PALETTE.map((color) => (
        <SparkAreaChart
          key={color}
          data={NUMBERS}
          color={color}
          height={36}
          aria-label={`Chart in ${color}`}
        />
      ))}
    </div>
  ),
};

// ─── Embedded in Cards ────────────────────────────────────────────────────────

const MetricCard = ({
  label,
  value,
  trend,
  children,
}: {
  label: string;
  value: string;
  trend: string;
  children: ReactNode;
}) => (
  <Card style={{ width: 200 }}>
    <Text variant="caption" color="dim">
      {label}
    </Text>
    <Text variant="title-2" as="p" style={{ margin: '4px 0 2px' }}>
      {value}
    </Text>
    <Text
      variant="caption"
      style={{ color: 'var(--gnome-success-color, #2ec27e)', marginBottom: 8 }}
    >
      {trend}
    </Text>
    {children}
  </Card>
);

export const InCards: StoryObj = {
  name: 'Embedded in Cards',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <MetricCard label="Downloads" value="12,430" trend="↑ +8.4%">
        <SparkAreaChart data={NUMBERS} height={48} aria-label="Downloads trend" />
      </MetricCard>
      <MetricCard label="Active users" value="3,841" trend="↑ +2.1%">
        <SparkLineChart
          data={[30, 45, 28, 60, 52, 75, 48, 82, 65, 78]}
          height={48}
          color={GNOME_CHART_PALETTE[1]}
          aria-label="Active users trend"
        />
      </MetricCard>
      <MetricCard label="Errors" value="127" trend="↓ −14%">
        <SparkBarChart
          data={[88, 72, 95, 60, 48, 55, 42, 38, 44, 30]}
          height={48}
          color={GNOME_CHART_PALETTE[4]}
          aria-label="Errors trend"
        />
      </MetricCard>
    </div>
  ),
};
