import type { Meta, StoryObj } from '@storybook/react-vite';

import { CweIdentifier } from './CweIdentifier';

const meta: Meta<typeof CweIdentifier> = {
  title: 'Components/CweIdentifier',
  component: CweIdentifier,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof CweIdentifier>;

export const Link: Story = {
  args: {
    cweId: 'CWE-79',
  },
};

export const StaticText: Story = {
  args: {
    cweId: 'CWE-89',
    link: false,
  },
};

export const NumericInput: Story = {
  args: {
    cweId: '352',
  },
};

export const Invalid: Story = {
  args: {
    cweId: 'SQL injection',
    link: false,
  },
};
