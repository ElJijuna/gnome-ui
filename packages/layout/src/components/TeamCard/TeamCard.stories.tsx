import { Button } from '@gnome-ui/react';
import type { Meta, StoryObj } from '@storybook/react';
import readme from './README.md?raw';
import { TeamCard } from './TeamCard';

const meta: Meta<typeof TeamCard> = {
  title: 'Layout/TeamCard',
  component: TeamCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: readme,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TeamCard>;

const members = [
  { name: 'Ada Lovelace' },
  { name: 'Grace Hopper' },
  { name: 'Katherine Johnson' },
  { name: 'Margaret Hamilton' },
];

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    name: 'Design',
    description: 'Product design and research',
    members,
  },
};

// ─── With action ──────────────────────────────────────────────────────────────

export const WithAction: Story = {
  args: {
    name: 'Design',
    description: 'Product design and research',
    members,
    action: <Button size="sm">View team</Button>,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Passing `action` automatically disables the `Card`'s own click behavior, since nesting a button inside an interactive `Card` (which renders as a `<button>`) would be invalid HTML.",
      },
    },
  },
};

// ─── Overflow avatars ───────────────────────────────────────────────────────────

export const OverflowAvatars: Story = {
  args: {
    name: 'Engineering',
    description: 'Platform and infrastructure',
    members: [
      { name: 'Ada Lovelace' },
      { name: 'Grace Hopper' },
      { name: 'Katherine Johnson' },
      { name: 'Margaret Hamilton' },
      { name: 'Radia Perlman' },
      { name: 'Barbara Liskov' },
      { name: 'Frances Allen' },
    ],
  },
  parameters: {
    docs: {
      description: { story: 'Beyond `maxAvatars` (default `5`), an overflow chip is shown.' },
    },
  },
};

// ─── No description ─────────────────────────────────────────────────────────────

export const NoDescription: Story = {
  args: {
    name: 'Marketing',
    members: members.slice(0, 2),
  },
};

// ─── Loading ──────────────────────────────────────────────────────────────────

export const LoadingSkeleton: Story = {
  args: {
    name: 'Design',
    members,
    loading: true,
    loadingType: 'skeleton',
  },
};

export const LoadingSpinner: Story = {
  args: {
    name: 'Design',
    members,
    loading: true,
    loadingType: 'spinner',
  },
};
