import type { Meta, StoryObj } from '@storybook/react';
import { CvssScore } from './CvssScore';
import readme from './README.md?raw';

const meta: Meta<typeof CvssScore> = {
  title: 'Components/CvssScore',
  component: CvssScore,
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
type Story = StoryObj<typeof CvssScore>;

export const AllRatings: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {[0, 2.4, 5.6, 7.8, 9.8].map((score) => (
        <CvssScore key={score} score={score} />
      ))}
    </div>
  ),
};

export const Critical: Story = {
  args: { score: 9.8 },
};

export const ScannerMinimal: Story = {
  args: { score: 0, severity: 'minimal' },
  parameters: {
    docs: {
      description: {
        story: '`minimal` should be used for scanner-provided severity, not CVSS-derived ratings.',
      },
    },
  },
};

export const ScoreOnly: Story = {
  args: { score: 7.2, showSeverity: false },
};
