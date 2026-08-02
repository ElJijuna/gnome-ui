import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './view-switcher';

interface ViewSwitcherArgs {
  active: string;
}

const VIEWS = ['List', 'Grid', 'Timeline'];

function renderViewSwitcher(args: ViewSwitcherArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  const eventOutput = document.createElement('p');
  eventOutput.className = 'wc-story__event';
  eventOutput.setAttribute('aria-live', 'polite');
  eventOutput.textContent = `Active view: ${args.active}`;

  const viewSwitcher = document.createElement('gnome-view-switcher');
  viewSwitcher.setAttribute('aria-label', 'View switcher');

  for (const view of VIEWS) {
    const item = document.createElement('button');
    item.type = 'button';
    item.role = 'radio';
    item.textContent = view;
    item.setAttribute('aria-checked', String(view === args.active));

    item.addEventListener('click', () => {
      for (const other of viewSwitcher.querySelectorAll('[role="radio"]')) {
        other.setAttribute('aria-checked', String(other === item));
      }

      eventOutput.textContent = `Active view: ${view}`;
    });

    viewSwitcher.append(item);
  }

  demo.append(viewSwitcher, eventOutput);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/View Switcher',
  component: 'gnome-view-switcher',
  tags: ['autodocs'],
  render: renderViewSwitcher,
  args: {
    active: 'List',
  },
  argTypes: {
    active: {
      control: 'select',
      options: VIEWS,
      description: 'The initially checked view.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Segmented control (`role="radiogroup"`) for switching between major views — mirrors `AdwViewSwitcher`. Unlike `gnome-tab-bar`, all four arrow keys cycle and moving focus also activates the target item (automatic activation, the radiogroup convention).',
      },
    },
  },
} satisfies Meta<ViewSwitcherArgs>;

export default meta;
type Story = StoryObj<ViewSwitcherArgs>;

export const Interactive: Story = {};

export const GridActive: Story = {
  args: {
    active: 'Grid',
  },
};
