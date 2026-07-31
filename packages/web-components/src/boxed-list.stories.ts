import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './action-row';
import './boxed-list';

interface BoxedListArgs {
  variant: 'default' | 'separate';
}

function renderSwitch(label: string, checked = false) {
  const el = document.createElement('input');
  el.type = 'checkbox';
  el.role = 'switch';
  el.checked = checked;
  el.setAttribute('aria-label', label);
  return el;
}

function renderRow({
  interactive = false,
  suffix,
  title,
  subtitle,
}: {
  interactive?: boolean;
  subtitle?: string;
  suffix?: HTMLElement;
  title: string;
}) {
  const row = document.createElement('gnome-action-row');
  row.interactive = interactive;

  const titleEl = document.createElement('span');
  titleEl.dataset.slot = 'row-title';
  titleEl.textContent = title;
  row.append(titleEl);

  if (subtitle) {
    const subtitleEl = document.createElement('span');
    subtitleEl.dataset.slot = 'row-subtitle';
    subtitleEl.textContent = subtitle;
    row.append(subtitleEl);
  }

  if (suffix) {
    const suffixEl = document.createElement('span');
    suffixEl.dataset.slot = 'row-suffix';
    suffixEl.append(suffix);
    row.append(suffixEl);
  }

  return row;
}

function renderStory(args: BoxedListArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';
  demo.style.maxWidth = '480px';
  demo.style.padding = '0';

  const list = document.createElement('gnome-boxed-list');
  list.style.width = '100%';
  list.variant = args.variant;

  list.append(
    renderRow({ subtitle: 'Home Network', suffix: renderSwitch('Wi-Fi', true), title: 'Wi-Fi' }),
    renderRow({ subtitle: 'Off', suffix: renderSwitch('Bluetooth'), title: 'Bluetooth' }),
    renderRow({ subtitle: 'Not connected', suffix: renderSwitch('VPN'), title: 'VPN' }),
  );

  demo.append(list);
  story.append(demo);
  return story;
}

const meta = {
  title: 'Web Components/Boxed List',
  component: 'gnome-boxed-list',
  tags: ['autodocs'],
  render: renderStory,
  args: {
    variant: 'default',
  },
  argTypes: {
    variant: {
      control: 'select',
      description: '"separate" renders each child as its own standalone card.',
      options: ['default', 'separate'],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Rounded bordered list grouping row-shaped children (e.g. gnome-action-row) with merged borders. The host sets role="list" and gives each direct child role="listitem".',
      },
    },
  },
} satisfies Meta<BoxedListArgs>;

export default meta;
type Story = StoryObj<BoxedListArgs>;

export const Default: Story = {};

export const SimpleRows: Story = {
  name: 'Simple rows',
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.maxWidth = '480px';
    demo.style.padding = '0';

    const list = document.createElement('gnome-boxed-list');
    list.style.width = '100%';

    for (const label of ['About', 'System', 'Users', 'Date & Time']) {
      list.append(renderRow({ interactive: true, title: label }));
    }

    demo.append(list);
    story.append(demo);
    return story;
  },
  parameters: { controls: { disable: true } },
};

export const WithActions: Story = {
  name: 'With actions',
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.maxWidth = '480px';
    demo.style.padding = '0';

    const reset = document.createElement('button');
    reset.type = 'button';
    reset.textContent = 'Reset';

    const list = document.createElement('gnome-boxed-list');
    list.style.width = '100%';
    list.append(
      renderRow({
        subtitle: 'Install updates automatically',
        suffix: renderSwitch('Automatic Updates', true),
        title: 'Automatic Updates',
      }),
      renderRow({
        subtitle: 'Help improve GNOME',
        suffix: renderSwitch('Usage & Diagnostics'),
        title: 'Usage & Diagnostics',
      }),
      renderRow({ suffix: reset, title: 'Reset Settings' }),
    );

    demo.append(list);
    story.append(demo);
    return story;
  },
  parameters: { controls: { disable: true } },
};

export const Separate: Story = {
  args: { variant: 'separate' },
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.maxWidth = '480px';
    demo.style.padding = '0';

    const list = document.createElement('gnome-boxed-list');
    list.style.width = '100%';
    list.variant = 'separate';
    list.append(
      renderRow({ interactive: true, subtitle: 'Display, sound, power', title: 'System Settings' }),
      renderRow({ interactive: true, subtitle: 'Home Network', title: 'Wi-Fi' }),
      renderRow({ interactive: true, subtitle: 'Off', title: 'Bluetooth' }),
    );

    demo.append(list);
    story.append(demo);
    return story;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'variant="separate" renders each child as its own standalone rounded card. Use when rows are independent items rather than a continuous grouped list.',
      },
    },
  },
};

export const LabelledSections: Story = {
  name: 'Labelled sections',
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.display = 'flex';
    demo.style.gap = '24px';
    demo.style.flexWrap = 'wrap';
    demo.style.padding = '0';

    function section(label: string, rows: HTMLElement[]) {
      const wrapper = document.createElement('div');
      wrapper.style.width = '240px';

      const heading = document.createElement('span');
      heading.textContent = label;
      heading.style.display = 'block';
      heading.style.marginBottom = '6px';
      heading.style.paddingLeft = '12px';
      heading.style.fontSize = '0.75rem';
      heading.style.opacity = '0.6';

      const list = document.createElement('gnome-boxed-list');
      list.append(...rows);

      wrapper.append(heading, list);
      return wrapper;
    }

    demo.append(
      section('Network', [
        renderRow({
          subtitle: 'Home Network',
          suffix: renderSwitch('Wi-Fi', true),
          title: 'Wi-Fi',
        }),
        renderRow({
          subtitle: 'Connected',
          suffix: renderSwitch('Ethernet', true),
          title: 'Ethernet',
        }),
      ]),
      section('Privacy', [
        renderRow({ suffix: renderSwitch('Location Services'), title: 'Location Services' }),
        renderRow({
          suffix: renderSwitch('Usage & Diagnostics'),
          title: 'Usage & Diagnostics',
        }),
      ]),
    );

    story.append(demo);
    return story;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Use a caption label above each list to group related sections in a settings view.',
      },
    },
  },
};
