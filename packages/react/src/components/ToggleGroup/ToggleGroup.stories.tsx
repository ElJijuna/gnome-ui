import { Edit, GoHome, PanEnd, PanStart, ViewMore, ViewSidebar } from '@gnome-ui/icons';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Text } from '../Text';
import readme from './README.md?raw';
import { ToggleGroup } from './ToggleGroup';
import { ToggleGroupItem } from './ToggleGroupItem';

const meta: Meta<typeof ToggleGroup> = {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
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
type Story = StoryObj<typeof ToggleGroup>;

export const LabelOnly: Story = {
  render: function LabelOnlyStory() {
    const [view, setView] = useState('list');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
        <ToggleGroup value={view} onValueChange={setView} aria-label="View mode">
          <ToggleGroupItem name="list" label="List" />
          <ToggleGroupItem name="grid" label="Grid" />
          <ToggleGroupItem name="columns" label="Columns" />
        </ToggleGroup>
        <Text variant="caption" color="dim">
          Selected: {view}
        </Text>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

export const IconOnly: Story = {
  render: function IconOnlyStory() {
    const [align, setAlign] = useState('start');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
        <ToggleGroup value={align} onValueChange={setAlign} aria-label="Text alignment">
          <ToggleGroupItem name="start" icon={PanStart} aria-label="Align left" />
          <ToggleGroupItem name="center" icon={ViewMore} aria-label="Align center" />
          <ToggleGroupItem name="end" icon={PanEnd} aria-label="Align right" />
        </ToggleGroup>
        <Text variant="caption" color="dim">
          Alignment: {align}
        </Text>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

export const IconAndLabel: Story = {
  render: function IconAndLabelStory() {
    const [mode, setMode] = useState('edit');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
        <ToggleGroup value={mode} onValueChange={setMode} aria-label="Editor mode">
          <ToggleGroupItem name="home" icon={GoHome} label="Home" />
          <ToggleGroupItem name="edit" icon={Edit} label="Edit" />
          <ToggleGroupItem name="sidebar" icon={ViewSidebar} label="Sidebar" />
        </ToggleGroup>
        <Text variant="caption" color="dim">
          Mode: {mode}
        </Text>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

export const WithDisabled: Story = {
  render: function WithDisabledStory() {
    const [val, setVal] = useState('a');

    return (
      <ToggleGroup value={val} onValueChange={setVal} aria-label="Options">
        <ToggleGroupItem name="a" label="Option A" />
        <ToggleGroupItem name="b" label="Option B" disabled />
        <ToggleGroupItem name="c" label="Option C" />
      </ToggleGroup>
    );
  },
  parameters: { controls: { disable: true } },
};
