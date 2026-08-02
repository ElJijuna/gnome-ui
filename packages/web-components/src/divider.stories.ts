import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './divider';

interface DividerArgs {
  label: string;
}

function renderDivider(args: DividerArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';
  demo.style.width = '100%';
  demo.style.maxWidth = '24rem';

  const divider = document.createElement('gnome-divider');
  divider.label = args.label;

  demo.append(divider);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Divider',
  component: 'gnome-divider',
  tags: ['autodocs'],
  render: renderDivider,
  args: {
    label: 'OR',
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Optional centered label. Omit for a bare dividing line.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Horizontal rule with an optional centered label — common auth/login-form pattern ("Sign in" / OR / "Continue with Google"). Distinct from `gnome-separator`, which has no label but supports a vertical orientation.',
      },
    },
  },
} satisfies Meta<DividerArgs>;

export default meta;
type Story = StoryObj<DividerArgs>;

export const Interactive: Story = {};

export const Bare: Story = {
  args: {
    label: '',
  },
};

export const ContinueWith: Story = {
  args: {
    label: 'Continue with Google',
  },
};
