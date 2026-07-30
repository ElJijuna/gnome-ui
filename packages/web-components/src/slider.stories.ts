import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './slider';

interface SliderArgs {
  disabled: boolean;
  max: number;
  min: number;
  step: number;
  value: number;
}

function renderSlider(args: SliderArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  const eventOutput = document.createElement('p');
  eventOutput.className = 'wc-story__event';
  eventOutput.setAttribute('aria-live', 'polite');
  eventOutput.textContent = `Brightness: ${args.value}.`;

  const slider = document.createElement('gnome-slider');
  slider.disabled = args.disabled;

  const control = document.createElement('input');
  control.type = 'range';
  control.dataset.slot = 'slider-control';
  control.setAttribute('aria-label', 'Brightness');
  control.min = String(args.min);
  control.max = String(args.max);
  control.step = String(args.step);
  control.value = String(args.value);

  slider.append(control);
  demo.append(slider, eventOutput);
  story.append(demo);

  control.addEventListener('input', () => {
    eventOutput.textContent = `Brightness: ${control.value}.`;
  });

  return story;
}

const meta = {
  title: 'Web Components/Slider',
  component: 'gnome-slider',
  tags: ['autodocs'],
  render: renderSlider,
  args: {
    disabled: false,
    max: 100,
    min: 0,
    step: 1,
    value: 50,
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disables the native light-DOM control.',
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
          'Styled light-DOM wrapper around a native <input type="range">. Native pointer/touch dragging and keyboard support (arrows, Home/End, Page Up/Down) keep working; the host only recomputes --gnome-slider-fill on every input event to paint the accent-colored fill.',
      },
    },
  },
} satisfies Meta<SliderArgs>;

export default meta;
type Story = StoryObj<SliderArgs>;

export const Interactive: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 30,
  },
};
