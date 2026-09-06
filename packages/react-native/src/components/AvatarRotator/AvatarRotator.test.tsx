import { fireEvent, render, screen } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { AvatarRotator } from './AvatarRotator';

const avatars = [
  'https://example.com/avatar-1.jpg',
  'https://example.com/avatar-2.jpg',
  'https://example.com/avatar-3.jpg',
];

describe('AvatarRotator', () => {
  it('renders a single accessible avatar surface', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <AvatarRotator name="Alice Bob" avatars={avatars} />
      </GnomeProvider>,
    );

    expect(screen.getByRole('img', { name: 'Alice Bob' })).toBeOnTheScreen();
  });

  it('falls back to Avatar initials when no avatar sources are provided', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <AvatarRotator name="Alice Bob" />
      </GnomeProvider>,
    );

    expect(screen.getByText('AB', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('filters empty avatar sources', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <AvatarRotator name="Alice" avatars={['', ' https://example.com/avatar.jpg ', '  ']} />
      </GnomeProvider>,
    );

    expect(screen.getAllByRole('img', { includeHiddenElements: true })).toHaveLength(2);
  });

  it('rotates through avatars on the configured interval', async () => {
    const onIndexChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <AvatarRotator name="Alice" avatars={avatars} interval={30} onIndexChange={onIndexChange} />
      </GnomeProvider>,
    );

    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(onIndexChange).toHaveBeenCalledWith(1);
  });

  it('supports a controlled active index', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <AvatarRotator name="Alice" avatars={avatars} activeIndex={2} />
      </GnomeProvider>,
    );

    expect(screen.getByRole('img', { name: 'Alice' })).toBeOnTheScreen();
  });

  it('pauses rotation while pressed', async () => {
    const onIndexChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <AvatarRotator name="Alice" avatars={avatars} interval={30} onIndexChange={onIndexChange} />
      </GnomeProvider>,
    );

    await fireEvent(screen.getByRole('img', { name: 'Alice' }), 'pressIn');
    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(onIndexChange).not.toHaveBeenCalled();
  });

  it('does not rotate a single avatar', async () => {
    const onIndexChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <AvatarRotator
          name="Alice"
          avatars={[avatars[0]]}
          interval={30}
          onIndexChange={onIndexChange}
        />
      </GnomeProvider>,
    );

    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(onIndexChange).not.toHaveBeenCalled();
  });
});
