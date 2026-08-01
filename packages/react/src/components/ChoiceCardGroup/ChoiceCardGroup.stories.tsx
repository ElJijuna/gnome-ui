import { Person, SystemUsers } from '@gnome-ui/icons';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { ChoiceCardGroup } from './ChoiceCardGroup';
import readme from './README.md?raw';

const meta: Meta<typeof ChoiceCardGroup> = {
  title: 'Components/ChoiceCardGroup',
  component: ChoiceCardGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    return <ChoiceCardGroup {...args} value={value} onChange={setValue} />;
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChoiceCardGroup>;

const accountOptions = [
  { value: 'personal', title: 'Personal', description: 'For individual use', icon: Person },
  { value: 'team', title: 'Team', description: 'For small groups', icon: SystemUsers },
  { value: 'enterprise', title: 'Enterprise', description: 'Advanced controls and support' },
];

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    label: 'Account type',
    options: accountOptions,
    value: 'personal',
  },
};

// ─── With helper text ──────────────────────────────────────────────────────────

export const WithHelperText: Story = {
  args: {
    label: 'Account type',
    helperText: 'You can change this later in settings.',
    options: accountOptions,
    value: 'team',
  },
};

// ─── Error state ───────────────────────────────────────────────────────────────

export const Error: Story = {
  args: {
    label: 'Account type',
    error: 'Choose an account type to continue.',
    options: accountOptions,
    value: undefined,
  },
};

// ─── Text only (no icons) ───────────────────────────────────────────────────────

export const TextOnly: Story = {
  args: {
    label: 'Starting template',
    options: [
      { value: 'blank', title: 'Blank document' },
      { value: 'letter', title: 'Letter' },
      { value: 'resume', title: 'Resume' },
      { value: 'report', title: 'Report' },
    ],
    value: 'blank',
  },
};

// ─── With a disabled option ─────────────────────────────────────────────────────

export const WithDisabledOption: Story = {
  args: {
    label: 'Account type',
    options: [
      ...accountOptions.slice(0, 2),
      { ...accountOptions[2], disabled: true, description: 'Contact sales to enable' },
    ],
    value: 'personal',
  },
};

// ─── Disabled group ─────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: {
    label: 'Account type',
    options: accountOptions,
    value: 'personal',
    disabled: true,
  },
};
