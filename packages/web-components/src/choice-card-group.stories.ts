import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './choice-card-group';

interface CardOption {
  value: string;
  title: string;
  description?: string;
  disabled?: boolean;
}

interface ChoiceCardGroupArgs {
  disabled: boolean;
  error: string;
  helperText: string;
  label: string;
  value: string;
}

const ACCOUNT_OPTIONS: CardOption[] = [
  { value: 'personal', title: 'Personal', description: 'For individual use' },
  { value: 'team', title: 'Team', description: 'For small groups' },
  { value: 'enterprise', title: 'Enterprise', description: 'Advanced controls and support' },
];

function createCard(option: CardOption, checked: boolean) {
  const card = document.createElement('button');
  card.type = 'button';
  card.setAttribute('role', 'radio');
  card.setAttribute('aria-checked', String(checked));
  card.dataset.value = option.value;
  card.disabled = Boolean(option.disabled);

  const title = document.createElement('span');
  title.dataset.slot = 'choice-card-title';
  title.textContent = option.title;
  card.append(title);

  if (option.description) {
    const description = document.createElement('span');
    description.dataset.slot = 'choice-card-description';
    description.textContent = option.description;
    card.append(description);
  }

  return card;
}

function wireSelection(group: HTMLElement, onSelect: (value: string) => void) {
  group.addEventListener('click', (event) => {
    const card = (event.target as HTMLElement).closest<HTMLElement>('[role="radio"]');

    if (!card || card.hasAttribute('disabled')) {
      return;
    }

    for (const sibling of group.querySelectorAll('[role="radio"]')) {
      sibling.setAttribute('aria-checked', String(sibling === card));
    }

    onSelect(card.dataset.value ?? '');
  });
}

function renderChoiceCardGroup(args: ChoiceCardGroupArgs, options: CardOption[] = ACCOUNT_OPTIONS) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';
  demo.style.width = '100%';
  demo.style.maxWidth = '32rem';

  const eventOutput = document.createElement('p');
  eventOutput.className = 'wc-story__event';
  eventOutput.setAttribute('aria-live', 'polite');
  eventOutput.textContent = `Selected: ${args.value}.`;

  const group = document.createElement('gnome-choice-card-group');
  group.setAttribute('label', args.label);
  group.toggleAttribute('disabled', args.disabled);

  if (args.error) {
    group.setAttribute('error', args.error);
  } else if (args.helperText) {
    group.setAttribute('helper-text', args.helperText);
  }

  for (const option of options) {
    group.append(createCard(option, option.value === args.value));
  }

  wireSelection(group, (value) => {
    eventOutput.textContent = `Selected: ${value}.`;
  });

  demo.append(group, eventOutput);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Choice Card Group',
  component: 'gnome-choice-card-group',
  tags: ['autodocs'],
  render: (args) => renderChoiceCardGroup(args),
  args: {
    disabled: false,
    error: '',
    helperText: 'You can change this later in settings.',
    label: 'Account type',
    value: 'personal',
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disables the fieldset — cascades to every card for free.',
    },
    error: {
      control: 'text',
      description: 'Error message shown in place of helperText, announced via role="alert".',
    },
    helperText: {
      control: 'text',
      description: 'Helper text shown below the label. Hidden when error is set.',
    },
    label: {
      control: 'text',
      description: "Group heading, rendered as the fieldset's <legend>.",
    },
    value: {
      control: 'select',
      options: ACCOUNT_OPTIONS.map((option) => option.value),
      description: 'Initially checked card value.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Card-based single-choice selector (`role="radiogroup"`) — large selectable cards instead of radio buttons. Wraps a real `<fieldset>`/`<legend>` plus roving-tabindex keyboard navigation with automatic activation, same algorithm as `gnome-view-switcher`.',
      },
    },
  },
} satisfies Meta<ChoiceCardGroupArgs>;

export default meta;
type Story = StoryObj<ChoiceCardGroupArgs>;

export const Default: Story = {};

export const WithDisabledOption: Story = {
  render: (args) =>
    renderChoiceCardGroup(args, [
      ...ACCOUNT_OPTIONS.slice(0, 2),
      { ...ACCOUNT_OPTIONS[2], disabled: true, description: 'Contact sales to enable' },
    ]),
  parameters: { controls: { disable: true } },
};

export const ErrorState: Story = {
  args: {
    error: 'Choose an account type to continue.',
    helperText: '',
    value: '',
  },
};

export const TextOnly: Story = {
  render: (args) =>
    renderChoiceCardGroup({ ...args, label: 'Starting template', helperText: '', value: 'blank' }, [
      { value: 'blank', title: 'Blank document' },
      { value: 'letter', title: 'Letter' },
      { value: 'resume', title: 'Resume' },
      { value: 'report', title: 'Report' },
    ]),
  parameters: { controls: { disable: true } },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: '`disabled` disables every card automatically via native fieldset behavior.',
      },
    },
  },
};
