import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './action-row';

interface ActionRowArgs {
  interactive: boolean;
  subtitle: string;
  title: string;
}

function renderList(...rows: HTMLElement[]) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';
  demo.style.maxWidth = '480px';
  demo.style.padding = '0';
  demo.style.gap = '0';

  const list = document.createElement('div');
  list.style.width = '100%';
  list.style.border = '1px solid var(--gnome-card-shade-color, rgb(0 0 0 / 0.1))';
  list.style.borderRadius = 'var(--gnome-radius-lg, 12px)';
  list.style.overflow = 'hidden';
  list.style.background = 'var(--gnome-card-bg-color, #fff)';

  rows.forEach((row, index) => {
    if (index > 0) {
      const divider = document.createElement('hr');
      divider.style.margin = '0';
      divider.style.border = 'none';
      divider.style.borderTop = '1px solid var(--gnome-card-shade-color, rgb(0 0 0 / 0.07))';
      list.append(divider);
    }

    list.append(row);
  });

  demo.append(list);
  story.append(demo);
  return story;
}

function renderRow({
  interactive = false,
  prefix,
  suffix,
  title,
  subtitle,
  variant,
}: {
  interactive?: boolean;
  prefix?: string;
  subtitle?: string;
  suffix?: HTMLElement;
  title: string;
  variant?: 'default' | 'property';
}) {
  const row = document.createElement('gnome-action-row');
  row.interactive = interactive;

  if (variant) {
    row.variant = variant;
  }

  if (prefix) {
    const prefixEl = document.createElement('span');
    prefixEl.dataset.slot = 'row-prefix';
    prefixEl.style.fontSize = '20px';
    prefixEl.textContent = prefix;
    row.append(prefixEl);
  }

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

function renderSwitch(label: string, checked = false) {
  const el = document.createElement('input');
  el.type = 'checkbox';
  el.role = 'switch';
  el.checked = checked;
  el.setAttribute('aria-label', label);
  return el;
}

function renderStory(args: ActionRowArgs) {
  return renderList(
    renderRow({
      interactive: args.interactive,
      subtitle: args.subtitle,
      title: args.title,
    }),
  );
}

const meta = {
  title: 'Web Components/Action Row',
  component: 'gnome-action-row',
  tags: ['autodocs'],
  render: renderStory,
  args: {
    interactive: false,
    subtitle: 'Home Network',
    title: 'Wi-Fi',
  },
  argTypes: {
    interactive: { control: 'boolean' },
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Standard settings row with data-slot="row-title/row-subtitle/row-prefix/row-suffix". interactive composes a real <button data-slot="row-surface"> around prefix + title/subtitle only, leaving row-suffix outside it.',
      },
    },
  },
} satisfies Meta<ActionRowArgs>;

export default meta;
type Story = StoryObj<ActionRowArgs>;

export const Default: Story = {};

export const WithSwitch: Story = {
  name: 'With switch',
  render: () =>
    renderList(
      renderRow({ subtitle: 'Home Network', suffix: renderSwitch('Wi-Fi', true), title: 'Wi-Fi' }),
      renderRow({ subtitle: 'Off', suffix: renderSwitch('Bluetooth'), title: 'Bluetooth' }),
      renderRow({ suffix: renderSwitch('Airplane Mode'), title: 'Airplane Mode' }),
    ),
  parameters: { controls: { disable: true } },
};

export const Interactive: Story = {
  render: () => {
    const rows = [
      renderRow({ interactive: true, subtitle: 'Device information', title: 'About' }),
      renderRow({ interactive: true, subtitle: 'Software updates', title: 'System' }),
      renderRow({ interactive: true, title: 'Users' }),
    ];

    for (const row of rows) {
      const label = row.querySelector('[data-slot="row-title"]')?.textContent ?? '';
      // gnome-activate is pre-filtered to real row activation (fires only
      // from row-surface, never from a row-suffix control), so no manual
      // stopPropagation() bookkeeping is needed even once these rows gain
      // a trailing widget.
      row.addEventListener('gnome-activate', () => window.alert(label));
    }

    return renderList(...rows);
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Set interactive for rows that navigate or trigger an action. Clicking (or Enter/Space-activating) the surface emits gnome-activate.',
      },
    },
  },
};

export const InteractiveWithSuffix: Story = {
  name: 'Interactive with a suffix control',
  render: () => {
    const row = renderRow({
      interactive: true,
      subtitle: 'Currently on',
      suffix: renderSwitch('Wi-Fi', true),
      title: 'Wi-Fi',
    });

    row.addEventListener('gnome-activate', () => window.alert('Wi-Fi row activated'));

    return renderList(row);
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'row-suffix stays outside the generated <button>, so clicking its own switch never fires gnome-activate — no stopPropagation() needed, unlike the React version.',
      },
    },
  },
};

export const WithLeadingIcon: Story = {
  name: 'With leading icon',
  render: () =>
    renderList(
      renderRow({
        prefix: '🔔',
        subtitle: 'Manage app alerts',
        suffix: renderSwitch('Notifications', true),
        title: 'Notifications',
      }),
      renderRow({
        prefix: '🔒',
        subtitle: 'Location & diagnostics',
        suffix: renderSwitch('Privacy'),
        title: 'Privacy',
      }),
    ),
  parameters: { controls: { disable: true } },
};

export const Property: Story = {
  render: () =>
    renderList(
      renderRow({ subtitle: 'GNOME OS 48', title: 'Operating System', variant: 'property' }),
      renderRow({ subtitle: '48.0 (2026-03-25)', title: 'Version', variant: 'property' }),
      renderRow({ subtitle: 'Linux 6.8.0', title: 'Kernel', variant: 'property' }),
      renderRow({ subtitle: '15.4 GiB', title: 'Memory', variant: 'property' }),
    ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'variant="property" flips the visual hierarchy: row-title shrinks to a dim caption label and row-subtitle becomes the prominent value. Use for read-only property display.',
      },
    },
  },
};

export const WithButton: Story = {
  name: 'With button',
  render: () => {
    const manage = document.createElement('button');
    manage.type = 'button';
    manage.textContent = 'Manage';

    const reset = document.createElement('button');
    reset.type = 'button';
    reset.textContent = 'Reset';

    return renderList(
      renderRow({ subtitle: '18.3 GB of 20 GB used', suffix: manage, title: 'Storage' }),
      renderRow({ suffix: reset, title: 'Reset Settings' }),
    );
  },
  parameters: { controls: { disable: true } },
};
