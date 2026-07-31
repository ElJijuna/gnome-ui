import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import readme from './README.md?raw';
import { StepIndicator } from './StepIndicator';

const meta: Meta<typeof StepIndicator> = {
  title: 'Components/StepIndicator',
  component: StepIndicator,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
  },
  args: {
    steps: 4,
    currentStep: 1,
    orientation: 'horizontal',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StepIndicator>;

// ─── Default (numbered) ─────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── Labelled steps ─────────────────────────────────────────────────────────────

export const LabelledSteps: Story = {
  args: {
    steps: ['Account', 'Profile', 'Preferences', 'Confirm'],
    currentStep: 1,
  },
};

// ─── First / last step ──────────────────────────────────────────────────────────

export const FirstStep: Story = {
  args: { steps: ['Account', 'Profile', 'Confirm'], currentStep: 0 },
};

export const LastStep: Story = {
  args: { steps: ['Account', 'Profile', 'Confirm'], currentStep: 2 },
};

// ─── Vertical ───────────────────────────────────────────────────────────────────

export const Vertical: Story = {
  args: {
    steps: ['Account details', 'Company profile', 'Billing', 'Confirmation'],
    currentStep: 1,
    orientation: 'vertical',
  },
};

// ─── Interactive (click to jump back) ──────────────────────────────────────────

export const Interactive: Story = {
  render: () => {
    const steps = ['Account', 'Profile', 'Preferences', 'Confirm'];
    const [currentStep, setCurrentStep] = useState(2);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <StepIndicator steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0}
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep((s) => Math.min(steps.length - 1, s + 1))}
            disabled={currentStep === steps.length - 1}
          >
            Next
          </button>
        </div>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
