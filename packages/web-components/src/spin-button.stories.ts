import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './spin-button';

interface SpinButtonArgs {
  disabled: boolean;
  max: number;
  min: number;
  step: number;
  value: number;
}

function renderSpinButton(args: SpinButtonArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  const eventOutput = document.createElement('p');
  eventOutput.className = 'wc-story__event';
  eventOutput.setAttribute('aria-live', 'polite');
  eventOutput.textContent = `Volume: ${args.value}.`;

  const spin = document.createElement('gnome-spin-button');
  spin.disabled = args.disabled;

  const decrement = document.createElement('button');
  decrement.type = 'button';
  decrement.dataset.slot = 'spin-button-decrement';
  decrement.setAttribute('aria-hidden', 'true');
  decrement.tabIndex = -1;
  decrement.textContent = '−';

  const control = document.createElement('input');
  control.type = 'number';
  control.dataset.slot = 'spin-button-control';
  control.setAttribute('aria-label', 'Volume');
  control.min = String(args.min);
  control.max = String(args.max);
  control.step = String(args.step);
  control.value = String(args.value);

  const increment = document.createElement('button');
  increment.type = 'button';
  increment.dataset.slot = 'spin-button-increment';
  increment.setAttribute('aria-hidden', 'true');
  increment.tabIndex = -1;
  increment.textContent = '+';

  spin.append(decrement, control, increment);
  demo.append(spin, eventOutput);
  story.append(demo);

  control.addEventListener('change', () => {
    eventOutput.textContent = `Volume: ${control.value}.`;
  });

  return story;
}

const meta = {
  title: 'Web Components/Spin Button',
  component: 'gnome-spin-button',
  tags: ['autodocs'],
  render: renderSpinButton,
  args: {
    disabled: false,
    max: 10,
    min: 0,
    step: 1,
    value: 5,
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disables the native control and both step buttons.',
    },
    max: { control: 'number' },
    min: { control: 'number' },
    step: { control: 'number' },
    value: { control: 'number' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Styled light-DOM wrapper around a native <input type="number"> with decrement/increment buttons wired to stepDown()/stepUp(). Native min/max/step validation, typing, and ArrowUp/ArrowDown keep working.',
      },
    },
  },
} satisfies Meta<SpinButtonArgs>;

export default meta;
type Story = StoryObj<SpinButtonArgs>;

export const Interactive: Story = {};

export const AtMax: Story = {
  args: {
    value: 10,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
