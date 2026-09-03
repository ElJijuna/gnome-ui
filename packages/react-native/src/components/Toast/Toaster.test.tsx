import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { Toaster } from './Toaster';

describe('Toaster', () => {
  it('renders its children', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Toaster>
          <Text>Hello</Text>
        </Toaster>
      </GnomeProvider>,
    );

    expect(screen.getByText('Hello')).toBeOnTheScreen();
  });

  it('anchors to the bottom by default', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Toaster testID="toaster" />
      </GnomeProvider>,
    );

    expect(screen.getByTestId('toaster')).toHaveStyle({ bottom: 24 });
  });

  it('anchors to the top when position="top"', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Toaster position="top" testID="toaster" />
      </GnomeProvider>,
    );

    expect(screen.getByTestId('toaster')).toHaveStyle({ top: 24 });
  });

  it('does not intercept touches in its own empty space', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Toaster testID="toaster" />
      </GnomeProvider>,
    );

    expect(screen.getByTestId('toaster').props.pointerEvents).toBe('box-none');
  });
});
