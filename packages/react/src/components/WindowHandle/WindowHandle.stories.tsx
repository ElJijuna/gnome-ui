import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { HeaderBar } from '../HeaderBar';
import { Text } from '../Text';
import { WindowTitle } from '../WindowTitle';

import { WindowHandle } from './WindowHandle';

const meta: Meta<typeof WindowHandle> = {
  title: 'Components/WindowHandle',
  component: WindowHandle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 560 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WindowHandle>;

export const InHeaderBar: Story = {
  render: function InHeaderBarStory() {
    const [maximized, setMaximized] = useState(false);
    const [action, setAction] = useState<string | null>(null);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <HeaderBar
          title={<WindowTitle title="Text Editor" subtitle="Untitled Document" />}
          end={
            <WindowHandle
              maximized={maximized}
              onMinimize={() => setAction('minimize')}
              onToggleMaximize={() => {
                setMaximized((value) => !value);
                setAction(maximized ? 'restore' : 'maximize');
              }}
              onClose={() => setAction('close')}
            />
          }
        />
        {action && (
          <Text variant="caption" color="dim">
            Last action: {action}
          </Text>
        )}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

export const CloseOnly: Story = {
  render: () => (
    <HeaderBar title="Utility Window" end={<WindowHandle hideMinimize hideMaximize />} />
  ),
  parameters: { controls: { disable: true } },
};
