import type { Meta, StoryObj } from '@storybook/react-vite';

import { CvssVector } from './CvssVector';

const meta: Meta<typeof CvssVector> = {
  title: 'Components/CvssVector',
  component: CvssVector,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof CvssVector>;

export const CriticalNetworkVector: Story = {
  args: {
    vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
  },
};

export const LocalLowImpactVector: Story = {
  args: {
    vector: 'CVSS:3.1/AV:L/AC:H/PR:L/UI:R/S:U/C:L/I:L/A:N',
  },
};

export const MetricsOnly: Story = {
  args: {
    vector: 'CVSS:3.0/AV:A/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:L',
    showVector: false,
  },
};

export const RawOnly: Story = {
  args: {
    vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    showMetrics: false,
  },
};
