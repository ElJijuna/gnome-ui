import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { StepIndicator } from './StepIndicator';

describe('StepIndicator', () => {
  describe('rendering', () => {
    it('renders a nav landmark labelled "Progress" by default', () => {
      render(<StepIndicator steps={4} currentStep={0} />);
      expect(screen.getByRole('navigation', { name: 'Progress' })).toBeInTheDocument();
    });

    it('accepts a custom label', () => {
      render(<StepIndicator steps={4} currentStep={0} label="Setup progress" />);
      expect(screen.getByRole('navigation', { name: 'Setup progress' })).toBeInTheDocument();
    });

    it('renders one numbered circle per step when given a number', () => {
      render(<StepIndicator steps={5} currentStep={0} />);
      expect(screen.getAllByText(/^[1-5]$/)).toHaveLength(5);
    });

    it('shows the "Step X of Y" caption when steps is a number', () => {
      render(<StepIndicator steps={5} currentStep={2} />);
      expect(screen.getByText('Step 3 of 5')).toBeInTheDocument();
    });

    it('does not show the caption when steps is an array of labels', () => {
      render(<StepIndicator steps={['Account', 'Profile', 'Confirm']} currentStep={0} />);
      expect(screen.queryByText(/Step \d+ of \d+/)).not.toBeInTheDocument();
    });

    it('renders each step label when given an array', () => {
      render(<StepIndicator steps={['Account', 'Profile', 'Confirm']} currentStep={0} />);
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    it('clamps an out-of-range currentStep', () => {
      render(<StepIndicator steps={3} currentStep={99} />);
      expect(screen.getByText('Step 3 of 3')).toBeInTheDocument();
    });
  });

  describe('step states', () => {
    it('marks the current step with aria-current="step"', () => {
      const { container } = render(<StepIndicator steps={3} currentStep={1} />);
      const current = container.querySelector('[aria-current="step"]');

      expect(current).toHaveTextContent('2');
    });

    it('renders a checkmark icon for completed steps', () => {
      const { container } = render(<StepIndicator steps={3} currentStep={2} />);

      expect(container.querySelectorAll('svg')).toHaveLength(2);
    });

    it('renders upcoming steps as plain numbers', () => {
      render(<StepIndicator steps={3} currentStep={0} />);
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('interactivity', () => {
    it('renders completed steps as buttons when onStepClick is provided', () => {
      render(<StepIndicator steps={3} currentStep={2} onStepClick={vi.fn()} />);
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });

    it('does not render the current or upcoming steps as buttons', () => {
      render(<StepIndicator steps={3} currentStep={1} onStepClick={vi.fn()} />);
      expect(screen.getAllByRole('button')).toHaveLength(1);
    });

    it('does not render any buttons when onStepClick is omitted', () => {
      render(<StepIndicator steps={3} currentStep={2} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('calls onStepClick with the clicked step index', async () => {
      const onStepClick = vi.fn();
      const user = userEvent.setup();

      render(
        <StepIndicator
          steps={['Account', 'Profile', 'Confirm']}
          currentStep={2}
          onStepClick={onStepClick}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Account' }));
      expect(onStepClick).toHaveBeenCalledExactlyOnceWith(0);
    });
  });

  describe('orientation', () => {
    it('defaults to horizontal', () => {
      const { container } = render(<StepIndicator steps={3} currentStep={0} />);
      expect(container.querySelector('nav')?.className).not.toMatch(/vertical/);
    });

    it('applies the vertical class when orientation="vertical"', () => {
      const { container } = render(
        <StepIndicator steps={3} currentStep={0} orientation="vertical" />,
      );
      expect(container.querySelector('nav')?.className).toMatch(/vertical/);
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the nav', () => {
      const { container } = render(<StepIndicator steps={3} currentStep={0} className="custom" />);
      expect(container.querySelector('nav')).toHaveClass('custom');
    });

    it('forwards data attributes', () => {
      render(<StepIndicator steps={3} currentStep={0} data-testid="wizard-progress" />);
      expect(screen.getByTestId('wizard-progress')).toBeInTheDocument();
    });
  });
});
