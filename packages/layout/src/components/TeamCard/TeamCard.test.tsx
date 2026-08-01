import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TeamCard } from './TeamCard';

const members = [{ name: 'Ada Lovelace' }, { name: 'Grace Hopper' }, { name: 'Katherine Johnson' }];

describe('TeamCard', () => {
  describe('identity', () => {
    it('renders the team name', () => {
      render(<TeamCard name="Design" members={members} />);
      expect(screen.getByText('Design')).toBeInTheDocument();
    });

    it('renders the description when provided', () => {
      render(
        <TeamCard name="Design" description="Product design and research" members={members} />,
      );
      expect(screen.getByText('Product design and research')).toBeInTheDocument();
    });

    it('does not render a description element when omitted', () => {
      render(<TeamCard name="Design" members={members} />);
      expect(screen.queryByText('Product design and research')).toBeNull();
    });
  });

  describe('members', () => {
    it('renders the avatar group', () => {
      const { container } = render(<TeamCard name="Design" members={members} />);
      expect(container.querySelector('[role="group"]')).toBeInTheDocument();
    });

    it('shows the plural member count', () => {
      render(<TeamCard name="Design" members={members} />);
      expect(screen.getByText('3 members')).toBeInTheDocument();
    });

    it('shows the singular member count', () => {
      render(<TeamCard name="Design" members={[{ name: 'Ada Lovelace' }]} />);
      expect(screen.getByText('1 member')).toBeInTheDocument();
    });

    it('shows a zero member count', () => {
      render(<TeamCard name="Design" members={[]} />);
      expect(screen.getByText('0 members')).toBeInTheDocument();
    });
  });

  describe('action', () => {
    it('renders the action slot when provided', () => {
      render(
        <TeamCard
          name="Design"
          members={members}
          action={<button type="button">View team</button>}
        />,
      );
      expect(screen.getByRole('button', { name: 'View team' })).toBeInTheDocument();
    });

    it('does not render an action slot when omitted', () => {
      // interactive=false so the Card itself doesn't render as a <button>,
      // isolating the assertion to the optional action slot.
      render(<TeamCard name="Design" members={members} interactive={false} />);
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('never nests the action inside a <button> root, even when interactive is requested', () => {
      const { container } = render(
        <TeamCard
          name="Design"
          members={members}
          interactive
          action={<button type="button">View team</button>}
        />,
      );

      expect(container.querySelector('button button')).toBeNull();
    });
  });

  describe('loading', () => {
    it("renders with aria-busy='true' when loading", () => {
      const { container } = render(<TeamCard name="Design" members={members} loading />);
      expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
    });

    it('does not render the team name when loading', () => {
      render(<TeamCard name="Design" members={members} loading />);
      expect(screen.queryByText('Design')).toBeNull();
    });

    it('renders skeleton by default when loading={true}', () => {
      render(<TeamCard name="Design" members={members} loading />);
      expect(screen.getByRole('status')).toHaveTextContent('Loading…');
    });

    it("renders spinner when loadingType='spinner'", () => {
      const { container } = render(
        <TeamCard name="Design" members={members} loading loadingType="spinner" />,
      );

      expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('does not render spinner when not loading', () => {
      render(<TeamCard name="Design" members={members} loadingType="spinner" />);
      expect(screen.getByText('Design')).toBeInTheDocument();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the root element', () => {
      const { container } = render(<TeamCard name="Design" members={members} className="custom" />);
      expect(container.firstChild).toHaveClass('custom');
    });

    it('forwards arbitrary HTML attributes to the root element', () => {
      render(<TeamCard name="Design" members={members} data-testid="team-card" />);
      expect(screen.getByTestId('team-card')).toBeInTheDocument();
    });
  });
});
