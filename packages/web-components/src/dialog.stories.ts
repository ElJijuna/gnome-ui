import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './dialog';

interface DialogArgs {
  alert: boolean;
  closeOnBackdrop: boolean;
  description: string;
  heading: string;
  open: boolean;
}

function renderDialog(args: DialogArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.textContent = 'Delete project';

  const eventOutput = document.createElement('p');
  eventOutput.className = 'wc-story__event';
  eventOutput.setAttribute('aria-live', 'polite');
  eventOutput.textContent = 'Open the dialog to exercise its focus behavior.';

  const dialog = document.createElement('gnome-dialog');
  dialog.toggleAttribute('alert', args.alert);
  dialog.toggleAttribute('close-on-backdrop', args.closeOnBackdrop);
  dialog.open = args.open;

  const surface = document.createElement('section');
  surface.dataset.slot = 'dialog-surface';

  const header = document.createElement('header');
  header.dataset.slot = 'dialog-header';

  const heading = document.createElement('h2');
  heading.dataset.slot = 'dialog-title';
  heading.textContent = args.heading;

  const description = document.createElement('p');
  description.dataset.slot = 'dialog-description';
  description.textContent = args.description;

  const body = document.createElement('div');
  body.dataset.slot = 'dialog-body';

  const label = document.createElement('label');
  label.textContent = 'Type the project name to confirm';

  const input = document.createElement('input');
  input.name = 'project';
  input.autocomplete = 'off';
  input.placeholder = 'gnome-ui';
  label.append(input);
  body.append(label);

  const actions = document.createElement('footer');
  actions.dataset.slot = 'dialog-actions';

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.autofocus = true;
  cancel.textContent = 'Cancel';

  const confirm = document.createElement('button');
  confirm.type = 'button';
  confirm.textContent = 'Delete';

  actions.append(cancel, confirm);
  header.append(heading, description);
  surface.append(header, body, actions);
  dialog.append(surface);
  demo.append(trigger, eventOutput, dialog);
  story.append(demo);

  trigger.addEventListener('click', () => dialog.showModal());
  cancel.addEventListener('click', () => dialog.close());
  confirm.addEventListener('click', () => dialog.close());
  dialog.addEventListener('gnome-open-change', (event) => {
    const { open } = (event as CustomEvent<{ open: boolean }>).detail;
    eventOutput.textContent = open ? 'Dialog opened.' : 'Dialog closed and focus restored.';
  });

  return story;
}

const meta = {
  title: 'Web Components/Dialog',
  component: 'gnome-dialog',
  tags: ['autodocs'],
  render: renderDialog,
  args: {
    alert: false,
    closeOnBackdrop: true,
    description: 'This permanently removes the project and its local settings.',
    heading: 'Delete this project?',
    open: false,
  },
  argTypes: {
    alert: {
      control: 'boolean',
      description: 'Uses alertdialog semantics for urgent decisions.',
    },
    closeOnBackdrop: {
      control: 'boolean',
      description: 'Allows pointer dismissal from the backdrop.',
    },
    description: {
      control: 'text',
      description: 'Light-DOM description referenced by aria-describedby.',
    },
    heading: {
      control: 'text',
      description: 'Light-DOM title referenced by aria-labelledby.',
    },
    open: {
      control: 'boolean',
      description: 'Reflects the open attribute.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Accessible modal dialog with focus trapping, Escape/backdrop dismissal, scroll locking, and focus restoration.',
      },
    },
  },
} satisfies Meta<DialogArgs>;

export default meta;
type Story = StoryObj<DialogArgs>;

export const Interactive: Story = {};

export const InitiallyOpen: Story = {
  args: {
    open: true,
  },
};

export const AlertDialog: Story = {
  args: {
    alert: true,
    heading: 'Discard unsaved changes?',
    description: 'Changes made in this session cannot be recovered.',
  },
};
