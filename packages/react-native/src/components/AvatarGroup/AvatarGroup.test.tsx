import { render, screen } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { AvatarGroup } from './AvatarGroup';

const avatars = [
  { name: 'Alice Martin' },
  { name: 'Bob Smith' },
  { name: 'Carol White' },
  { name: 'David Brown' },
  { name: 'Eva Green' },
];

describe('AvatarGroup', () => {
  it('renders all avatars when count is under max', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <AvatarGroup avatars={avatars.slice(0, 3)} max={5} />
      </GnomeProvider>,
    );

    expect(screen.getAllByRole('img')).toHaveLength(3);
  });

  it('renders max avatars plus an overflow chip when count exceeds max', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <AvatarGroup avatars={avatars} max={3} />
      </GnomeProvider>,
    );

    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.getByText('+2', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('does not render an overflow chip when count equals max exactly', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <AvatarGroup avatars={avatars.slice(0, 3)} max={3} />
      </GnomeProvider>,
    );

    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.queryByLabelText(/more$/)).not.toBeOnTheScreen();
  });

  it('overflow chip shows the correct remaining count', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <AvatarGroup avatars={avatars} max={2} />
      </GnomeProvider>,
    );

    expect(screen.getByText('+3', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.getByLabelText('+3 more')).toBeOnTheScreen();
  });

  it('has an accessible group label listing all names', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <AvatarGroup avatars={avatars.slice(0, 3)} max={5} />
      </GnomeProvider>,
    );

    expect(screen.getByRole('group').props.accessibilityLabel).toBe(
      'Alice Martin, Bob Smith, Carol White',
    );
  });

  it('group label includes the overflow count when avatars exceed max', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <AvatarGroup avatars={avatars} max={3} />
      </GnomeProvider>,
    );

    expect(screen.getByRole('group').props.accessibilityLabel).toBe(
      'Alice Martin, Bob Smith, Carol White, David Brown, Eva Green and 2 more',
    );
  });

  it('accepts a custom accessibilityLabel', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <AvatarGroup avatars={avatars.slice(0, 2)} accessibilityLabel="Team members" />
      </GnomeProvider>,
    );

    expect(screen.getByRole('group').props.accessibilityLabel).toBe('Team members');
  });

  it('renders without crashing when avatars is empty', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <AvatarGroup avatars={[]} />
      </GnomeProvider>,
    );

    expect(screen.getByRole('group')).toBeOnTheScreen();
    expect(screen.getByRole('group').props.accessibilityLabel).toBe('Avatar group');
  });
});
