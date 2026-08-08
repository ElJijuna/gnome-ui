import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import readme from './README.md?raw';
import {
  type WidgetDefinition,
  WidgetManager,
  type WidgetManagerPickerSurface,
} from './WidgetManager';

const placeholderBlock = (width: string) => (
  <div
    style={{
      width,
      height: 12,
      borderRadius: 4,
      backgroundColor: 'var(--gnome-card-shade-color, rgb(0 0 0 / 0.1))',
    }}
  />
);

const catalog: WidgetDefinition[] = [
  {
    id: 'clock',
    label: 'Clock',
    description: 'Shows the current time',
    render: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {placeholderBlock('60%')}
        {placeholderBlock('40%')}
      </div>
    ),
  },
  {
    id: 'weather',
    label: 'Weather',
    description: 'Local forecast at a glance',
    render: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {placeholderBlock('80%')}
        {placeholderBlock('50%')}
        {placeholderBlock('65%')}
      </div>
    ),
  },
  {
    id: 'notes',
    label: 'Notes',
    description: 'Pinned sticky notes',
    render: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {placeholderBlock('90%')}
      </div>
    ),
  },
];

const meta: Meta<typeof WidgetManager> = {
  title: 'Components/WidgetManager',
  component: WidgetManager,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    title: { control: 'text' },
    pickerSurface: { control: 'inline-radio', options: ['modal', 'bottomSheet', 'drawer'] },
  },
  args: {
    title: 'Dashboard',
    catalog,
  },
};

export default meta;
type Story = StoryObj<typeof WidgetManager>;

export const Empty: Story = {
  render: (args) => {
    const [value, setValue] = useState<string[]>([]);

    return <WidgetManager {...args} value={value} onChange={setValue} />;
  },
  parameters: { controls: { disable: true } },
};

export const EditingEmpty: Story = {
  render: (args) => {
    const [value, setValue] = useState<string[]>([]);

    return (
      <WidgetManager
        {...args}
        value={value}
        onChange={setValue}
        // No prop to force edit mode from outside — click the pencil to
        // enter it, same as a real consumer would.
      />
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Click the pencil icon in the header to enter edit mode and reveal the trigger.',
      },
    },
  },
};

export const WithWidgets: Story = {
  render: (args) => {
    const [value, setValue] = useState<string[]>(['clock']);

    return <WidgetManager {...args} value={value} onChange={setValue} />;
  },
  parameters: { controls: { disable: true } },
};

export const EditingWithWidgets: Story = {
  render: (args) => {
    const [value, setValue] = useState<string[]>(['clock', 'weather']);

    return <WidgetManager {...args} value={value} onChange={setValue} />;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Click the pencil icon to enter edit mode — the widgets stay, and the trigger appears below them.',
      },
    },
  },
};

export const PickerSurface: Story = {
  render: (args) => {
    const [value, setValue] = useState<string[]>(['clock']);
    const [pickerSurface, setPickerSurface] = useState<WidgetManagerPickerSurface>('modal');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['modal', 'bottomSheet', 'drawer'] as const).map((surface) => (
            <label key={surface} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                type="radio"
                name="pickerSurface"
                checked={pickerSurface === surface}
                onChange={() => setPickerSurface(surface)}
              />
              {surface}
            </label>
          ))}
        </div>
        <WidgetManager {...args} pickerSurface={pickerSurface} value={value} onChange={setValue} />
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

export const FullFlow: Story = {
  render: (args) => {
    const [value, setValue] = useState<string[]>([]);

    return <WidgetManager {...args} value={value} onChange={setValue} />;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Recreates the full flow: click the pencil to edit, click "Add Widget" to open the picker, toggle a couple of widgets, and Accept to see them rendered back in the card.',
      },
    },
  },
};
