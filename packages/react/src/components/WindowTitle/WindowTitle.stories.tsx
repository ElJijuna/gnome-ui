import { DocumentOpen } from '@gnome-ui/icons';
import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../Button';
import { HeaderBar } from '../HeaderBar';
import { Icon } from '../Icon';
import readme from './README.md?raw';
import { WindowTitle } from './WindowTitle';

const meta: Meta<typeof WindowTitle> = {
  title: 'Components/WindowTitle',
  component: WindowTitle,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
  args: {
    title: 'Files',
    subtitle: '/home/user/Documents',
  },
};

export default meta;
type Story = StoryObj<typeof WindowTitle>;

// ─── Default (in HeaderBar) ────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => <HeaderBar title={<WindowTitle {...args} />} />,
};

// ─── Title only ────────────────────────────────────────────────────────────────

export const TitleOnly: Story = {
  render: () => <HeaderBar title={<WindowTitle title="Settings" />} />,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Without a `subtitle`, renders a single centred line — identical to a plain string title.',
      },
    },
  },
};

// ─── With actions ─────────────────────────────────────────────────────────────

export const WithActions: Story = {
  render: () => (
    <HeaderBar
      title={<WindowTitle title="Text Editor" subtitle="Untitled Document" />}
      start={
        <Button variant="flat">
          <Icon icon={DocumentOpen} />
        </Button>
      }
      end={<Button variant="suggested">Save</Button>}
    />
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Typical header bar with start/end action buttons and a two-line `WindowTitle` in the centre.',
      },
    },
  },
};

// ─── Long subtitle truncation ─────────────────────────────────────────────────

export const LongSubtitle: Story = {
  render: () => (
    <HeaderBar
      title={
        <WindowTitle
          title="Files"
          subtitle="/home/user/Documents/Projects/my-very-long-project-name/src/components"
        />
      }
    />
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Long subtitles are truncated with an ellipsis to prevent overflowing the header bar.',
      },
    },
  },
};
