import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './expander';

interface ExpanderArgs {
  disabled: boolean;
  expanded: boolean;
  label: string;
}

function renderExpander(args: ExpanderArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';
  demo.style.width = '100%';
  demo.style.maxWidth = '22rem';

  const expander = document.createElement('gnome-expander');
  expander.setAttribute('label', args.label);
  expander.toggleAttribute('expanded', args.expanded);
  expander.toggleAttribute('disabled', args.disabled);

  const content = document.createElement('p');
  content.style.margin = '0';
  content.style.color = 'var(--gnome-window-fg-color, rgb(0 0 0 / 0.55))';
  content.textContent =
    "These settings are rarely needed — change them only if you know what you're doing.";

  expander.append(content);
  demo.append(expander);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Expander',
  component: 'gnome-expander',
  tags: ['autodocs'],
  render: renderExpander,
  args: {
    disabled: false,
    expanded: false,
    label: 'Show advanced options',
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disables the toggle.',
    },
    expanded: {
      control: 'boolean',
      description: 'Initial expanded state.',
    },
    label: {
      control: 'text',
      description: 'Clickable header label.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Standalone disclosure triangle + collapsible content — mirrors `GtkExpander`. A bare, unstyled counterpart to `gnome-expander-row`, which is scoped to `gnome-action-row`'s header-slot layout.",
      },
    },
  },
} satisfies Meta<ExpanderArgs>;

export default meta;
type Story = StoryObj<ExpanderArgs>;

export const Basic: Story = {};

export const DefaultExpanded: Story = {
  args: {
    expanded: true,
  },
};

export const Controlled: Story = {
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.width = '100%';
    demo.style.maxWidth = '22rem';

    const eventOutput = document.createElement('p');
    eventOutput.className = 'wc-story__event';
    eventOutput.setAttribute('aria-live', 'polite');
    eventOutput.textContent = 'Expanded: false.';

    const expander = document.createElement('gnome-expander');
    expander.setAttribute('label', 'Show advanced options');

    const content = document.createElement('p');
    content.style.margin = '0';
    content.textContent = 'Controlled from outside.';
    expander.append(content);

    expander.addEventListener('gnome-open-change', (event) => {
      eventOutput.textContent = `Expanded: ${(event as CustomEvent<{ open: boolean }>).detail.open}.`;
    });

    demo.append(expander, eventOutput);
    story.append(demo);

    return story;
  },
  parameters: { controls: { disable: true } },
};

export const InAForm: Story = {
  render: () => {
    const story = document.createElement('main');
    story.className = 'wc-story';

    const demo = document.createElement('div');
    demo.className = 'wc-story__demo';
    demo.style.width = '100%';
    demo.style.maxWidth = '22rem';
    demo.style.gap = 'var(--gnome-space-3, 16px)';

    const serverField = document.createElement('label');
    serverField.style.display = 'grid';
    serverField.style.gap = 'var(--gnome-space-1, 6px)';
    serverField.style.width = '100%';
    serverField.textContent = 'Server address';

    const serverInput = document.createElement('input');
    serverInput.placeholder = 'matrix.org';
    serverField.append(serverInput);

    const expander = document.createElement('gnome-expander');
    expander.setAttribute('label', 'Show advanced options');

    const fields = document.createElement('div');
    fields.style.display = 'flex';
    fields.style.flexDirection = 'column';
    fields.style.gap = 'var(--gnome-space-3, 16px)';

    for (const [label, placeholder] of [
      ['Custom port', '443'],
      ['Proxy URL', 'Optional'],
    ]) {
      const field = document.createElement('label');
      field.style.display = 'grid';
      field.style.gap = 'var(--gnome-space-1, 6px)';
      field.style.width = '100%';
      field.textContent = label;

      const input = document.createElement('input');
      input.placeholder = placeholder;
      field.append(input);
      fields.append(field);
    }

    expander.append(fields);
    demo.append(serverField, expander);
    story.append(demo);

    return story;
  },
  parameters: { controls: { disable: true } },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
