import type { Meta, StoryObj } from '@storybook/react';

import { ActionRow } from '../ActionRow';
import { BoxedList } from '../BoxedList';
import { Switch } from '../Switch';
import { Text } from '../Text';

import { Clamp } from './Clamp';
import readme from './README.md?raw';

const meta: Meta<typeof Clamp> = {
  title: 'Adaptive/Clamp',
  component: Clamp,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Clamp>;

export const Default: Story = {
  render: () => (
    <div style={{ background: 'rgba(0,0,0,0.04)', padding: 24 }}>
      <Clamp maximumSize={480}>
        <BoxedList>
          <ActionRow
            title="Wi-Fi"
            subtitle="Connected to Home Network"
            trailing={<Switch defaultChecked aria-label="Wi-Fi" />}
          />
          <ActionRow title="Bluetooth" trailing={<Switch aria-label="Bluetooth" />} />
          <ActionRow title="Airplane Mode" trailing={<Switch aria-label="Airplane mode" />} />
        </BoxedList>
      </Clamp>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const NarrowContent: Story = {
  render: () => (
    <div style={{ background: 'rgba(0,0,0,0.04)', padding: 24 }}>
      <Clamp maximumSize={320}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Text variant="title-4">Narrow clamp</Text>
          <Text variant="body" color="dim">
            This content is constrained to 320 px maximum. Resize the window to see it shrink below
            that.
          </Text>
        </div>
      </Clamp>
    </div>
  ),
  parameters: { controls: { disable: true } },
};
