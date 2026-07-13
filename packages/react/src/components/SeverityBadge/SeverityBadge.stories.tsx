import type { Meta, StoryObj } from '@storybook/react';
import readme from './README.md?raw';
import { SeverityBadge } from './SeverityBadge';
import { VULNERABILITY_SEVERITIES, type VulnerabilitySeverity } from './severity';

const meta: Meta<typeof SeverityBadge> = {
  title: 'Components/SeverityBadge',
  component: SeverityBadge,
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
type Story = StoryObj<typeof SeverityBadge>;

export const AllSeverities: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {VULNERABILITY_SEVERITIES.map((severity) => (
        <SeverityBadge key={severity} severity={severity} />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`minimal` sits between `none` and `low` for external scanner compatibility, such as GAR/Grafeas.',
      },
    },
  },
};

const stories = VULNERABILITY_SEVERITIES.reduce(
  (acc, severity) => {
    acc[severity] = {
      args: { severity },
    };

    return acc;
  },
  {} as Record<VulnerabilitySeverity, Story>,
);

export const None = stories.none;
export const Minimal = stories.minimal;
export const Low = stories.low;
export const Medium = stories.medium;
export const High = stories.high;
export const Critical = stories.critical;
