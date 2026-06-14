import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AvatarGroup } from './AvatarGroup';

const avatars = [
  { name: 'Alice Martin' },
  { name: 'Bob Smith' },
  { name: 'Carol White' },
  { name: 'David Brown' },
  { name: 'Eva Green' },
];

describe('AvatarGroup', () => {
  it('renders all avatars when count is under max', () => {
    const { container } = render(<AvatarGroup avatars={avatars.slice(0, 3)} max={5} />);

    expect(container.querySelectorAll('[role="img"]')).toHaveLength(3);
  });

  it('renders max avatars plus overflow chip when count exceeds max', () => {
    const { container, getByText } = render(<AvatarGroup avatars={avatars} max={3} />);

    expect(container.querySelectorAll('[role="img"]')).toHaveLength(3);
    expect(getByText('+2')).toBeInTheDocument();
  });

  it('does not render overflow chip when count equals max exactly', () => {
    const { container, queryByText } = render(
      <AvatarGroup avatars={avatars.slice(0, 3)} max={3} />,
    );

    expect(container.querySelectorAll('[role="img"]')).toHaveLength(3);
    expect(queryByText(/^\+\d/)).not.toBeInTheDocument();
  });

  it('overflow chip shows the correct remaining count', () => {
    const { getByText } = render(<AvatarGroup avatars={avatars} max={2} />);

    expect(getByText('+3')).toBeInTheDocument();
  });

  it('has an accessible aria-label listing all names', () => {
    const { getByRole } = render(<AvatarGroup avatars={avatars.slice(0, 3)} max={5} />);

    expect(getByRole('group')).toHaveAttribute(
      'aria-label',
      'Alice Martin, Bob Smith, Carol White',
    );
  });

  it('aria-label includes overflow count when avatars exceed max', () => {
    const { getByRole } = render(<AvatarGroup avatars={avatars} max={3} />);

    expect(getByRole('group')).toHaveAttribute(
      'aria-label',
      'Alice Martin, Bob Smith, Carol White, David Brown, Eva Green and 2 more',
    );
  });

  it('applies the size class to the root element', () => {
    const { getByRole } = render(<AvatarGroup avatars={avatars.slice(0, 2)} size="lg" />);

    expect(getByRole('group').className).toMatch(/lg/);
  });

  it('passes extra HTML attributes to the root span', () => {
    const { getByRole } = render(
      <AvatarGroup avatars={avatars.slice(0, 2)} data-testid="my-group" />,
    );

    expect(getByRole('group')).toHaveAttribute('data-testid', 'my-group');
  });

  it('renders without crashing when avatars is empty', () => {
    const { getByRole } = render(<AvatarGroup avatars={[]} />);

    expect(getByRole('group')).toBeInTheDocument();
  });
});
