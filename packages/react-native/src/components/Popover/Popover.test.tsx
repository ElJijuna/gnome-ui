import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { GnomeProvider } from '@/GnomeProvider';
import { Popover } from './Popover';

describe('Popover', () => {
  it('does not show the panel before the trigger is pressed', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Popover content={<Text>Rich content</Text>}>
          <Button>Open</Button>
        </Popover>
      </GnomeProvider>,
    );

    expect(screen.queryByRole('dialog')).not.toBeOnTheScreen();
  });

  it('opens the panel on trigger press', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Popover content={<Text>Rich content</Text>}>
          <Button>Open</Button>
        </Popover>
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('button'));

    expect(screen.getByRole('dialog')).toBeOnTheScreen();
    expect(screen.getByText('Rich content')).toBeOnTheScreen();
    expect(screen.getByRole('button').props.accessibilityState.expanded).toBe(true);
  });

  it('closes the panel when the trigger is pressed again', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Popover content={<Text>Rich content</Text>}>
          <Button>Open</Button>
        </Popover>
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button'));

    expect(screen.queryByRole('dialog')).not.toBeOnTheScreen();
  });

  it('closes on an outside (backdrop) press', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Popover content={<Text>Rich content</Text>}>
          <Button>Open</Button>
        </Popover>
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toBeOnTheScreen();

    // The backdrop is the Pressable wrapping the panel — pressing it directly
    // (not the panel itself) exercises the outside-tap-closes path.
    await fireEvent.press(screen.getByRole('dialog').parent!);

    expect(screen.queryByRole('dialog')).not.toBeOnTheScreen();
  });

  it('claims the touch responder on the panel so inert content never falls through to the backdrop', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Popover content={<Text>Rich content</Text>}>
          <Button>Open</Button>
        </Popover>
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('button'));

    expect(screen.getByRole('dialog').props.onStartShouldSetResponder()).toBe(true);
  });

  it("still invokes the trigger's own onPress alongside toggling", async () => {
    const onPress = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Popover content={<Text>Rich content</Text>}>
          <Button onPress={onPress}>Open</Button>
        </Popover>
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('dialog')).toBeOnTheScreen();
  });

  describe('controlled mode', () => {
    it('respects the controlled open prop rather than internal state', async () => {
      const onOpenChange = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <Popover content={<Text>Rich content</Text>} open={false} onOpenChange={onOpenChange}>
            <Button>Open</Button>
          </Popover>
        </GnomeProvider>,
      );

      await fireEvent.press(screen.getByRole('button'));

      // Nothing updates `open` from outside, so the panel stays closed even
      // though the trigger was pressed — only the callback fires.
      expect(screen.queryByRole('dialog')).not.toBeOnTheScreen();
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('shows the panel when the controlled open prop is true', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Popover content={<Text>Rich content</Text>} open onOpenChange={jest.fn()}>
            <Button>Open</Button>
          </Popover>
        </GnomeProvider>,
      );

      expect(screen.getByRole('dialog')).toBeOnTheScreen();
    });
  });
});
