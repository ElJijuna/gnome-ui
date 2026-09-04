import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from '@/components/Button';
import { GnomeProvider } from '@/GnomeProvider';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('does not show the tooltip before it is triggered', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Tooltip label="Save file">
          <Button>Trigger</Button>
        </Tooltip>
      </GnomeProvider>,
    );

    expect(screen.queryByRole('tooltip')).not.toBeOnTheScreen();
  });

  it('shows the tooltip on long press', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Tooltip label="Save file">
          <Button>Trigger</Button>
        </Tooltip>
      </GnomeProvider>,
    );

    await fireEvent(screen.getByRole('button'), 'longPress');

    expect(screen.getByRole('tooltip')).toBeOnTheScreen();
    expect(screen.getByText('Save file')).toBeOnTheScreen();
  });

  it('hides the tooltip on press out', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Tooltip label="Save file">
          <Button>Trigger</Button>
        </Tooltip>
      </GnomeProvider>,
    );

    await fireEvent(screen.getByRole('button'), 'longPress');
    expect(screen.getByRole('tooltip')).toBeOnTheScreen();

    await fireEvent(screen.getByRole('button'), 'pressOut');

    expect(screen.queryByRole('tooltip')).not.toBeOnTheScreen();
  });

  it('shows the tooltip on hover in, after the delay', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Tooltip label="Save file" delay={0}>
          <Button>Trigger</Button>
        </Tooltip>
      </GnomeProvider>,
    );

    await fireEvent(screen.getByRole('button'), 'hoverIn');

    await screen.findByRole('tooltip');
  });

  it('hides the tooltip on hover out', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Tooltip label="Save file" delay={0}>
          <Button>Trigger</Button>
        </Tooltip>
      </GnomeProvider>,
    );

    await fireEvent(screen.getByRole('button'), 'hoverIn');
    await screen.findByRole('tooltip');

    await fireEvent(screen.getByRole('button'), 'hoverOut');

    expect(screen.queryByRole('tooltip')).not.toBeOnTheScreen();
  });

  it('shows the tooltip on focus and hides it on blur', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Tooltip label="Save file" delay={0}>
          <Button>Trigger</Button>
        </Tooltip>
      </GnomeProvider>,
    );

    await fireEvent(screen.getByRole('button'), 'focus');
    await screen.findByRole('tooltip');

    await fireEvent(screen.getByRole('button'), 'blur');

    expect(screen.queryByRole('tooltip')).not.toBeOnTheScreen();
  });

  it('sets accessibilityHint on the trigger to the label by default', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Tooltip label="Save file">
          <Button>Trigger</Button>
        </Tooltip>
      </GnomeProvider>,
    );

    expect(screen.getByRole('button').props.accessibilityHint).toBe('Save file');
  });

  it("does not override the trigger's own accessibilityHint", async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Tooltip label="Save file">
          <Button accessibilityHint="Custom hint">Trigger</Button>
        </Tooltip>
      </GnomeProvider>,
    );

    expect(screen.getByRole('button').props.accessibilityHint).toBe('Custom hint');
  });
});
