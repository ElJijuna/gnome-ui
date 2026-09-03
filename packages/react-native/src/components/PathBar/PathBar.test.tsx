import { fireEvent, render, screen } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { PathBar } from './PathBar';

const segments = [
  { label: 'Home', path: '/home' },
  { label: 'Documents', path: '/home/documents' },
  { label: 'Projects', path: '/home/documents/projects' },
];

describe('PathBar', () => {
  it('renders every segment label', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <PathBar segments={segments} />
      </GnomeProvider>,
    );

    expect(screen.getByText('Home')).toBeOnTheScreen();
    expect(screen.getByText('Documents')).toBeOnTheScreen();
    expect(screen.getByText('Projects')).toBeOnTheScreen();
  });

  it('renders a chevron separator between segments but not before the first', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <PathBar segments={segments} />
      </GnomeProvider>,
    );

    expect(screen.getAllByText('›', { includeHiddenElements: true })).toHaveLength(2);
  });

  it('makes every segment except the last a pressable button', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <PathBar segments={segments} />
      </GnomeProvider>,
    );

    expect(screen.getByRole('button', { name: 'Home' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Documents' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Projects' })).not.toBeOnTheScreen();
  });

  it('calls onNavigate with the path and index of the pressed segment', async () => {
    const onNavigate = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <PathBar segments={segments} onNavigate={onNavigate} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Documents' }));
    expect(onNavigate).toHaveBeenCalledWith('/home/documents', 1);
  });

  it('renders a single segment as only the current, non-interactive label', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <PathBar segments={[{ label: 'Home', path: '/home' }]} />
      </GnomeProvider>,
    );

    expect(screen.getByText('Home')).toBeOnTheScreen();
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
    expect(screen.queryByText('›')).not.toBeOnTheScreen();
  });
});
