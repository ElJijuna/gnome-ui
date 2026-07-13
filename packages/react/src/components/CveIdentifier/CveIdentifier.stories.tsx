import type { Meta, StoryObj } from '@storybook/react';
import { CveIdentifier } from './CveIdentifier';
import readme from './README.md?raw';

const meta: Meta<typeof CveIdentifier> = {
  title: 'Components/CveIdentifier',
  component: CveIdentifier,
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
type Story = StoryObj<typeof CveIdentifier>;

export const CveOrg: Story = {
  args: { cveId: 'CVE-2024-3094' },
};

export const Nvd: Story = {
  args: { cveId: 'CVE-2024-3094', source: 'nvd' },
};

export const Static: Story = {
  args: { cveId: 'CVE-2024-3094', link: false },
};

export const Invalid: Story = {
  args: { cveId: 'GHSA-xxxx-yyyy', link: false },
};
