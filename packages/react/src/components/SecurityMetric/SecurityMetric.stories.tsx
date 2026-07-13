import type { Meta, StoryObj } from '@storybook/react';
import readme from './README.md?raw';
import { SecurityMetric } from './SecurityMetric';

const meta: Meta<typeof SecurityMetric> = {
  title: 'Components/SecurityMetric',
  component: SecurityMetric,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: readme,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SecurityMetric>;

export const CriticalFindings: Story = {
  args: {
    label: 'Critical findings',
    value: 7,
    severity: 'critical',
    description: 'Require immediate triage',
    delta: '+2 since last scan',
    trend: 'up',
  },
};

export const Improved: Story = {
  args: {
    label: 'Open CVEs',
    value: 18,
    severity: 'medium',
    description: 'Across production images',
    delta: '-5 this week',
    trend: 'down',
  },
};

export const MinimalScannerSeverity: Story = {
  args: {
    label: 'GAR severity',
    value: 'Minimal',
    severity: 'minimal',
    description: 'Scanner-provided severity',
  },
};

export const Grid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))', gap: 12 }}>
      <SecurityMetric label="Critical" value={7} severity="critical" delta="+2" trend="up" />
      <SecurityMetric label="Open CVEs" value={18} severity="medium" delta="-5" trend="down" />
      <SecurityMetric label="Avg CVSS" value="6.4" description="Last scan" />
    </div>
  ),
};
