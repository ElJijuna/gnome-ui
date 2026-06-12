import { Copy, Delete, Edit, Share, ViewMore } from '@gnome-ui/icons';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Button } from '../Button';
import { Icon } from '../Icon';
import { Text } from '../Text';

import { PopoverMenu } from './PopoverMenu';

const meta: Meta<typeof PopoverMenu> = {
  title: 'Components/PopoverMenu',
  component: PopoverMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof PopoverMenu>;

export const ContextMenu: Story = {
  render: function ContextMenuStory() {
    const [selected, setSelected] = useState<string | null>(null);

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <PopoverMenu
          sections={[
            {
              items: [
                {
                  id: 'edit',
                  label: 'Edit',
                  icon: Edit,
                  shortcut: 'Ctrl+E',
                  onSelect: () => setSelected('edit'),
                },
                {
                  id: 'copy',
                  label: 'Copy Link',
                  icon: Copy,
                  shortcut: 'Ctrl+C',
                  onSelect: () => setSelected('copy'),
                },
                { id: 'share', label: 'Share...', icon: Share, disabled: true },
              ],
            },
            {
              items: [
                {
                  id: 'delete',
                  label: 'Delete',
                  icon: Delete,
                  destructive: true,
                  onSelect: () => setSelected('delete'),
                },
              ],
            },
          ]}
        >
          <Button variant="flat" shape="circular" aria-label="More options">
            <Icon icon={ViewMore} size="md" aria-hidden />
          </Button>
        </PopoverMenu>
        {selected && (
          <Text variant="caption" color="dim">
            Selected: {selected}
          </Text>
        )}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
