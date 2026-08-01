import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChoiceCardGroup } from './ChoiceCardGroup';

const options = [
  { value: 'personal', title: 'Personal', description: 'For individual use' },
  { value: 'team', title: 'Team', description: 'For small groups' },
  { value: 'enterprise', title: 'Enterprise', disabled: true },
];

describe('ChoiceCardGroup', () => {
  describe('rendering', () => {
    it('renders one radio card per option', () => {
      render(<ChoiceCardGroup options={options} onChange={vi.fn()} label="Account type" />);
      expect(screen.getAllByRole('radio')).toHaveLength(3);
    });

    it('renders the label as a legend', () => {
      render(<ChoiceCardGroup options={options} onChange={vi.fn()} label="Account type" />);
      expect(screen.getByText('Account type').tagName).toBe('LEGEND');
    });

    it('renders each card title and description', () => {
      render(<ChoiceCardGroup options={options} onChange={vi.fn()} />);
      expect(screen.getByText('Personal')).toBeInTheDocument();
      expect(screen.getByText('For individual use')).toBeInTheDocument();
    });

    it('renders helper text', () => {
      render(
        <ChoiceCardGroup
          options={options}
          onChange={vi.fn()}
          helperText="You can change this later."
        />,
      );
      expect(screen.getByText('You can change this later.')).toBeInTheDocument();
    });

    it('renders error message instead of helper text', () => {
      render(
        <ChoiceCardGroup
          options={options}
          onChange={vi.fn()}
          helperText="Helper"
          error="Choose an option."
        />,
      );
      expect(screen.getByText('Choose an option.')).toBeInTheDocument();
      expect(screen.queryByText('Helper')).not.toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('marks the selected card with aria-checked', () => {
      render(<ChoiceCardGroup options={options} value="team" onChange={vi.fn()} />);
      const radios = screen.getAllByRole('radio');

      expect(radios[0]).toHaveAttribute('aria-checked', 'false');
      expect(radios[1]).toHaveAttribute('aria-checked', 'true');
    });

    it('calls onChange with the clicked option value', () => {
      const onChange = vi.fn();

      render(<ChoiceCardGroup options={options} onChange={onChange} />);
      fireEvent.click(screen.getByRole('radio', { name: /Personal/ }));

      expect(onChange).toHaveBeenCalledWith('personal');
    });

    it('does not select a disabled card', () => {
      const onChange = vi.fn();

      render(<ChoiceCardGroup options={options} onChange={onChange} />);
      fireEvent.click(screen.getByRole('radio', { name: /Enterprise/ }));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('roving tabindex', () => {
    it('makes the selected card the only tabbable one', () => {
      render(<ChoiceCardGroup options={options} value="team" onChange={vi.fn()} />);
      const radios = screen.getAllByRole('radio');

      expect(radios[0]).toHaveAttribute('tabIndex', '-1');
      expect(radios[1]).toHaveAttribute('tabIndex', '0');
      expect(radios[2]).toHaveAttribute('tabIndex', '-1');
    });

    it('makes the first enabled card tabbable when nothing is selected', () => {
      render(<ChoiceCardGroup options={options} onChange={vi.fn()} />);
      const radios = screen.getAllByRole('radio');

      expect(radios[0]).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('keyboard navigation', () => {
    it('ArrowRight moves focus and selection to the next enabled card', () => {
      const onChange = vi.fn();

      render(<ChoiceCardGroup options={options} value="personal" onChange={onChange} />);
      const radios = screen.getAllByRole('radio');

      radios[0].focus();
      fireEvent.keyDown(radios[0], { key: 'ArrowRight' });

      expect(onChange).toHaveBeenCalledWith('team');
      expect(radios[1]).toHaveFocus();
    });

    it('skips a disabled card when moving forward', () => {
      const onChange = vi.fn();

      render(<ChoiceCardGroup options={options} value="team" onChange={onChange} />);
      const radios = screen.getAllByRole('radio');

      radios[1].focus();
      fireEvent.keyDown(radios[1], { key: 'ArrowRight' });

      // wraps back to the first enabled card, skipping the disabled "Enterprise" one
      expect(onChange).toHaveBeenCalledWith('personal');
      expect(radios[0]).toHaveFocus();
    });

    it('ArrowLeft moves focus and selection to the previous enabled card', () => {
      const onChange = vi.fn();

      render(<ChoiceCardGroup options={options} value="team" onChange={onChange} />);
      const radios = screen.getAllByRole('radio');

      radios[1].focus();
      fireEvent.keyDown(radios[1], { key: 'ArrowLeft' });

      expect(onChange).toHaveBeenCalledWith('personal');
      expect(radios[0]).toHaveFocus();
    });
  });

  describe('disabled', () => {
    it('disables every card when the group is disabled', () => {
      render(<ChoiceCardGroup options={options} onChange={vi.fn()} disabled />);

      for (const radio of screen.getAllByRole('radio')) {
        expect(radio).toBeDisabled();
      }
    });
  });

  describe('accessibility', () => {
    it('sets role=radiogroup on the card container', () => {
      render(<ChoiceCardGroup options={options} onChange={vi.fn()} label="Account type" />);
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('sets aria-describedby on the group when error is present', () => {
      const { container } = render(
        <ChoiceCardGroup options={options} onChange={vi.fn()} error="Choose an option." />,
      );
      expect(container.querySelector('fieldset')).toHaveAttribute('aria-describedby');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the fieldset', () => {
      const { container } = render(
        <ChoiceCardGroup options={options} onChange={vi.fn()} className="custom" />,
      );
      expect(container.querySelector('fieldset')).toHaveClass('custom');
    });

    it('forwards data attributes to the fieldset', () => {
      render(<ChoiceCardGroup options={options} onChange={vi.fn()} data-testid="account-type" />);
      expect(screen.getByTestId('account-type')).toBeInTheDocument();
    });
  });
});
