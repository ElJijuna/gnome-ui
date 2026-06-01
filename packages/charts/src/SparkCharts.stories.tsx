import { Card, Text } from '@gnome-ui/react';
import type { Meta, StoryObj } from '@storybook/react';

import { GNOME_CHART_PALETTE } from './colors';
import { SparkAreaChart } from './components/SparkAreaChart';
import { SparkBarChart } from './components/SparkBarChart';
import { SparkLineChart } from './components/SparkLineChart';

// ─── Sample data ─────────────────────────────────────────────────────────────

const NUMBERS = [42, 58, 35, 72, 61, 88, 54, 93, 70, 85];

const OBJECTS = NUMBERS.map((v, i) => ({ day: `D${i + 1}`, sessions: v }));

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Charts/Spark',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

// ─── SparkAreaChart ───────────────────────────────────────────────────────────

export const Area: Story = {
  name: 'SparkAreaChart — numbers',
  render: () => (
    <div style={{ width: 200 }}>
      <SparkAreaChart data={NUMBERS} height={48} aria-label="Weekly trend" />
    </div>
  ),
};

export const AreaObjects: Story = {
  name: 'SparkAreaChart — objects',
  render: () => (
    <div style={{ width: 200 }}>
      <SparkAreaChart data={OBJECTS} dataKey="sessions" height={48} aria-label="Daily sessions" />
    </div>
  ),
};

export const AreaNoGradient: Story = {
  name: 'SparkAreaChart — no gradient',
  render: () => (
    <div style={{ width: 200 }}>
      <SparkAreaChart
        data={NUMBERS}
        gradient={false}
        fillOpacity={0.25}
        height={48}
        aria-label="Weekly trend"
      />
    </div>
  ),
};

// ─── SparkLineChart ───────────────────────────────────────────────────────────

export const Line: Story = {
  name: 'SparkLineChart',
  render: () => (
    <div style={{ width: 200 }}>
      <SparkLineChart data={NUMBERS} height={48} aria-label="Weekly trend" />
    </div>
  ),
};

// ─── SparkBarChart ────────────────────────────────────────────────────────────

export const Bar: Story = {
  name: 'SparkBarChart',
  render: () => (
    <div style={{ width: 200 }}>
      <SparkBarChart data={NUMBERS} height={48} aria-label="Weekly trend" />
    </div>
  ),
};

// ─── All colors ───────────────────────────────────────────────────────────────

export const AllColors: Story = {
  name: 'Palette colors',
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: 240,
      }}
    >
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

// ─── In Cards ─────────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  trend,
  children,
}: {
  label: string;
  value: string;
  trend: string;
  children: React.ReactNode;
}) {
  return (
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
}

export const InCards: Story = {
  name: 'Embedded in Cards',
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
