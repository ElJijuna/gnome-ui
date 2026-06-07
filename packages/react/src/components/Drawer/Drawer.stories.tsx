import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { ActionRow } from '../ActionRow';
import { BoxedList } from '../BoxedList';
import { Button } from '../Button';
import { Text } from '../Text';

import { Drawer } from './Drawer';
import readme from './README.md?raw';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    open: { control: 'boolean' },
    side: { control: 'inline-radio', options: ['left', 'right'] },
    size: { control: 'inline-radio', options: ['classic', 'wide'] },
    title: { control: 'text' },
    closeOnBackdrop: { control: 'boolean' },
  },
  args: {
    open: false,
    side: 'right',
    size: 'classic',
    title: 'Details',
    closeOnBackdrop: true,
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Drawer</Button>
        <Drawer {...args} open={open} onClose={() => setOpen(false)}>
          <Text variant="body" color="dim">
            Drawer content can be any React node passed as children.
          </Text>
        </Drawer>
      </>
    );
  },
  parameters: { controls: { disable: true } },
};

export const LeftContentProp: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Show Filters</Button>
        <Drawer
          open={open}
          side="left"
          size="wide"
          title="Filters"
          onClose={() => setOpen(false)}
          content={
            <BoxedList>
              <ActionRow title="All files" onClick={() => setOpen(false)} />
              <ActionRow title="Images" onClick={() => setOpen(false)} />
              <ActionRow title="Documents" onClick={() => setOpen(false)} />
            </BoxedList>
          }
        />
      </>
    );
  },
  parameters: { controls: { disable: true } },
};
