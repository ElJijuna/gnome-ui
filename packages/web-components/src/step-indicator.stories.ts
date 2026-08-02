import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './step-indicator';

interface StepIndicatorArgs {
  clickable: boolean;
  current: number;
  labels: string;
  orientation: 'horizontal' | 'vertical';
  steps: number;
}

function renderStepIndicator(args: StepIndicatorArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';

  const eventOutput = document.createElement('p');
  eventOutput.className = 'wc-story__event';
  eventOutput.setAttribute('aria-live', 'polite');
  eventOutput.textContent = `Current step: ${args.current + 1}`;

  const stepIndicator = document.createElement('gnome-step-indicator');
  stepIndicator.setAttribute('steps', args.labels || String(args.steps));
  stepIndicator.current = args.current;
  stepIndicator.orientation = args.orientation;
  stepIndicator.clickable = args.clickable;

  stepIndicator.addEventListener('gnome-select', (event) => {
    const { step } = (event as CustomEvent<{ step: number }>).detail;
    stepIndicator.current = step;
    eventOutput.textContent = `Current step: ${step + 1}`;
  });

  demo.append(stepIndicator, eventOutput);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Step Indicator',
  component: 'gnome-step-indicator',
  tags: ['autodocs'],
  render: renderStepIndicator,
  args: {
    clickable: true,
    current: 1,
    labels: 'Account, Profile, Confirm',
    orientation: 'horizontal',
    steps: 4,
  },
  argTypes: {
    clickable: {
      control: 'boolean',
      description: 'Makes completed steps real buttons emitting gnome-select.',
    },
    current: { control: 'number' },
    labels: {
      control: 'text',
      description: 'Comma-separated labels — takes priority over the plain steps count.',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    steps: {
      control: 'number',
      description: 'Used only when labels is empty (unlabelled sequence).',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Numbered "Step X of Y" progress indicator for onboarding/wizard flows. Purely attribute-driven and fully host-derived — `steps` accepts either a plain count (unlabelled) or a comma-separated label list.',
      },
    },
  },
} satisfies Meta<StepIndicatorArgs>;

export default meta;
type Story = StoryObj<StepIndicatorArgs>;

export const Interactive: Story = {};

export const Unlabelled: Story = {
  args: {
    current: 2,
    labels: '',
    steps: 5,
  },
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
};

export const NotClickable: Story = {
  args: {
    clickable: false,
  },
};
