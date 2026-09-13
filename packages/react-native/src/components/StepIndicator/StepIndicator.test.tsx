import { fireEvent, render, screen } from '@testing-library/react-native';

import { StepIndicator } from './StepIndicator';

describe('StepIndicator', () => {
  describe('rendering', () => {
    it('renders a navigation container labelled "Progress" by default', async () => {
      await render(<StepIndicator steps={4} currentStep={0} testID="nav" />);
      const nav = screen.getByTestId('nav');

      expect(nav.props.role).toBe('navigation');
      expect(nav.props.accessibilityLabel).toBe('Progress');
    });

    it('accepts a custom label', async () => {
      await render(<StepIndicator steps={4} currentStep={0} label="Setup progress" testID="nav" />);
      expect(screen.getByTestId('nav').props.accessibilityLabel).toBe('Setup progress');
    });

    it('renders one numbered circle per step when given a number', async () => {
      await render(<StepIndicator steps={5} currentStep={0} />);
      expect(screen.getAllByText(/^[1-5]$/)).toHaveLength(5);
    });

    it('shows the "Step X of Y" caption when steps is a number', async () => {
      await render(<StepIndicator steps={5} currentStep={2} />);
      expect(screen.getByText('Step 3 of 5')).toBeOnTheScreen();
    });

    it('does not show the caption when steps is an array of labels', async () => {
      await render(<StepIndicator steps={['Account', 'Profile', 'Confirm']} currentStep={0} />);
      expect(screen.queryByText(/Step \d+ of \d+/)).not.toBeOnTheScreen();
    });

    it('renders each step label when given an array', async () => {
      await render(<StepIndicator steps={['Account', 'Profile', 'Confirm']} currentStep={0} />);
      expect(screen.getByText('Account')).toBeOnTheScreen();
      expect(screen.getByText('Profile')).toBeOnTheScreen();
      expect(screen.getByText('Confirm')).toBeOnTheScreen();
    });

    it('clamps an out-of-range currentStep', async () => {
      await render(<StepIndicator steps={3} currentStep={99} />);
      expect(screen.getByText('Step 3 of 3')).toBeOnTheScreen();
    });
  });

  describe('step states', () => {
    it('marks the current step as selected', async () => {
      await render(<StepIndicator steps={3} currentStep={1} />);
      const current = screen.getByText('2');

      expect(current.parent?.props.accessibilityState.selected).toBe(true);
    });

    it('renders upcoming steps as plain numbers', async () => {
      await render(<StepIndicator steps={3} currentStep={0} />);
      expect(screen.getByText('2')).toBeOnTheScreen();
      expect(screen.getByText('3')).toBeOnTheScreen();
    });

    it('renders a checkmark icon (not a number) for completed steps', async () => {
      await render(<StepIndicator steps={3} currentStep={2} />);

      expect(screen.queryByText('1')).not.toBeOnTheScreen();
      expect(screen.queryByText('2')).not.toBeOnTheScreen();
    });
  });

  describe('interactivity', () => {
    it('renders completed steps as buttons when onStepClick is provided', async () => {
      await render(<StepIndicator steps={3} currentStep={2} onStepClick={jest.fn()} />);
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });

    it('does not render the current or upcoming steps as buttons', async () => {
      await render(<StepIndicator steps={3} currentStep={1} onStepClick={jest.fn()} />);
      expect(screen.getAllByRole('button')).toHaveLength(1);
    });

    it('does not render any buttons when onStepClick is omitted', async () => {
      await render(<StepIndicator steps={3} currentStep={2} />);
      expect(screen.queryByRole('button')).not.toBeOnTheScreen();
    });

    it('calls onStepClick with the clicked step index', async () => {
      const onStepClick = jest.fn();

      await render(
        <StepIndicator
          steps={['Account', 'Profile', 'Confirm']}
          currentStep={2}
          onStepClick={onStepClick}
        />,
      );

      await fireEvent.press(screen.getByRole('button', { name: 'Account' }));
      expect(onStepClick).toHaveBeenCalledWith(0);
    });
  });

  describe('orientation', () => {
    it('defaults to horizontal', async () => {
      await render(<StepIndicator steps={3} currentStep={0} testID="nav" />);
      expect(screen.getByTestId('nav')).toBeOnTheScreen();
    });

    it('renders without crashing when orientation="vertical"', async () => {
      await render(<StepIndicator steps={3} currentStep={0} orientation="vertical" />);
      expect(screen.getAllByText(/^[1-3]$/)).toHaveLength(3);
    });
  });

  describe('prop forwarding', () => {
    it('forwards testID to the root container', async () => {
      await render(<StepIndicator steps={3} currentStep={0} testID="wizard-progress" />);
      expect(screen.getByTestId('wizard-progress')).toBeOnTheScreen();
    });
  });
});
