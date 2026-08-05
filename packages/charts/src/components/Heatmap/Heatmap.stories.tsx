import type { Meta, StoryObj } from '@storybook/react';

import { Heatmap } from './Heatmap';
import readme from './README.md?raw';

const meta: Meta<typeof Heatmap> = {
  title: 'Charts/Heatmap',
  component: Heatmap,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: readme } },
  },
  argTypes: {
    data: { control: false },
    rows: { control: false },
    columns: { control: false },
    valueFormatter: { control: false },
    className: { control: false },
    cellSize: { control: { type: 'number', min: 20, max: 80, step: 4 } },
    showValues: { control: 'boolean' },
    showLegend: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Heatmap>;

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['00', '04', '08', '12', '16', '20'];

const ACTIVITY_DATA = DAYS.flatMap((day, dayIndex) =>
  HOURS.map((hour, hourIndex) => ({
    row: day,
    column: hour,
    value: Math.round(
      Math.abs(Math.sin(dayIndex * 1.3 + hourIndex * 0.7)) * 90 +
        (dayIndex >= 5 ? 0 : 10),
    ),
  })),
);

export const Default: Story = {
  args: {
    data: ACTIVITY_DATA,
    rows: DAYS,
    columns: HOURS,
    showValues: false,
  },
};

export const WithValues: Story = {
  args: {
    data: ACTIVITY_DATA,
    rows: DAYS,
    columns: HOURS,
    showValues: true,
    cellSize: 44,
  },
};

export const WithLegend: Story = {
  args: {
    data: ACTIVITY_DATA,
    rows: DAYS,
    columns: HOURS,
    showLegend: true,
  },
};

const METRICS = ['Revenue', 'Users', 'Latency', 'Errors'];

export const CorrelationMatrix: Story = {
  args: {
    data: [
      { row: 'Revenue', column: 'Revenue', value: 1 },
      { row: 'Revenue', column: 'Users', value: 0.82 },
      { row: 'Revenue', column: 'Latency', value: -0.14 },
      { row: 'Revenue', column: 'Errors', value: -0.31 },
      { row: 'Users', column: 'Revenue', value: 0.82 },
      { row: 'Users', column: 'Users', value: 1 },
      { row: 'Users', column: 'Latency', value: 0.22 },
      { row: 'Users', column: 'Errors', value: -0.05 },
      { row: 'Latency', column: 'Revenue', value: -0.14 },
      { row: 'Latency', column: 'Users', value: 0.22 },
      { row: 'Latency', column: 'Latency', value: 1 },
      { row: 'Latency', column: 'Errors', value: 0.64 },
      { row: 'Errors', column: 'Revenue', value: -0.31 },
      { row: 'Errors', column: 'Users', value: -0.05 },
      { row: 'Errors', column: 'Latency', value: 0.64 },
      { row: 'Errors', column: 'Errors', value: 1 },
    ],
    rows: METRICS,
    columns: METRICS,
    min: -1,
    max: 1,
    showValues: true,
    cellSize: 56,
  },
};

export const SparseMatrix: Story = {
  args: {
    data: [
      { row: 'A', column: 'X', value: 10 },
      { row: 'B', column: 'Y', value: 40 },
      { row: 'C', column: 'Z', value: 25 },
    ],
    rows: ['A', 'B', 'C'],
    columns: ['X', 'Y', 'Z'],
    showValues: true,
  },
};
