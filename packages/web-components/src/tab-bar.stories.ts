import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './tab-bar';

interface TabBarArgs {
  inline: boolean;
}

const TAB_LABELS = ['General', 'Notifications', 'Privacy', 'Advanced'];

function renderTabBar(args: TabBarArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  const eventOutput = document.createElement('p');
  eventOutput.className = 'wc-story__event';
  eventOutput.setAttribute('aria-live', 'polite');
  eventOutput.textContent = 'Selected: General';

  const tabBar = document.createElement('gnome-tab-bar');
  tabBar.inline = args.inline;
  tabBar.setAttribute('aria-label', 'Settings sections');

  for (const [index, label] of TAB_LABELS.entries()) {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.role = 'tab';
    tab.textContent = label;
    tab.setAttribute('aria-selected', String(index === 0));

    if (label === 'Privacy') {
      tab.disabled = true;
    }

    tab.addEventListener('click', () => {
      for (const other of tabBar.querySelectorAll('[role="tab"]')) {
        other.setAttribute('aria-selected', String(other === tab));
      }

      eventOutput.textContent = `Selected: ${label}`;
    });

    tabBar.append(tab);
  }

  demo.append(tabBar, eventOutput);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Tab Bar',
  component: 'gnome-tab-bar',
  tags: ['autodocs'],
  render: renderTabBar,
  args: {
    inline: false,
  },
  argTypes: {
    inline: {
      control: 'boolean',
      description: 'Removes the header-bar background so the bar blends into its container.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Horizontal `role="tablist"`. The host only manages roving-tabindex keyboard navigation (Left/Right/Home/End) — it does not create tabs or manage `aria-selected`/panel visibility, which stays with the consumer, same division of responsibility as `@gnome-ui/react`\'s `TabBar`.',
      },
    },
  },
} satisfies Meta<TabBarArgs>;

export default meta;
type Story = StoryObj<TabBarArgs>;

export const Interactive: Story = {};

export const Inline: Story = {
  args: {
    inline: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Use inside a card or content area instead of directly under a header bar.',
      },
    },
  },
};
