import { Settings } from '@gnome-ui/icons';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { Drawer } from './Drawer';

describe('Drawer', () => {
  it('renders as a dialog from the right by default', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Drawer open>
          <Text>Drawer action</Text>
        </Drawer>
      </GnomeProvider>,
    );

    expect(screen.getByRole('dialog')).toBeOnTheScreen();
    expect(screen.getByText('Drawer action')).toBeOnTheScreen();
  });

  it('renders the content prop with configured side and size', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Drawer open side="left" size="wide" content={<Text>Left panel content</Text>} />
      </GnomeProvider>,
    );

    expect(screen.getByText('Left panel content')).toBeOnTheScreen();
  });

  it('does not render when closed', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Drawer open={false}>
          <Text>Hidden</Text>
        </Drawer>
      </GnomeProvider>,
    );

    expect(screen.queryByText('Hidden')).not.toBeOnTheScreen();
  });

  it('closes on backdrop press', async () => {
    const onClose = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Drawer open onClose={onClose} testID="drawer-backdrop">
          <Text>Menu action</Text>
        </Drawer>
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByTestId('drawer-backdrop'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on backdrop press when closeOnBackdrop is false', async () => {
    const onClose = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Drawer open onClose={onClose} closeOnBackdrop={false} testID="drawer-backdrop">
          <Text>Done</Text>
        </Drawer>
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByTestId('drawer-backdrop'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('narrows a drawer nested inside a parent drawer', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Drawer open testID="parent">
          <Drawer open testID="child">
            <Text>Nested content</Text>
          </Drawer>
        </Drawer>
      </GnomeProvider>,
    );

    const dialogs = screen.getAllByRole('dialog');
    const parentWidth = (dialogs[0].parent!.props.style as { width: number }).width;
    const childWidth = (dialogs[1].parent!.props.style as { width: number }).width;

    expect(parentWidth).toBe(420);
    expect(childWidth).toBe(357);
  });

  it('renders a rail with selected state and fires onPress per entry', async () => {
    const onPressA = jest.fn();
    const onPressB = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Drawer
          open
          rail={[
            { id: 'a', icon: Settings, label: 'Section A', active: true, onPress: onPressA },
            { id: 'b', icon: Settings, label: 'Section B', onPress: onPressB },
          ]}
        >
          <Text>Body</Text>
        </Drawer>
      </GnomeProvider>,
    );

    const sectionA = screen.getByRole('button', { name: 'Section A' });
    const sectionB = screen.getByRole('button', { name: 'Section B' });

    expect(sectionA.props.accessibilityState).toEqual(expect.objectContaining({ selected: true }));
    expect(sectionB.props.accessibilityState).toEqual(expect.objectContaining({ selected: false }));

    await fireEvent.press(sectionB);

    expect(onPressB).toHaveBeenCalledTimes(1);
    expect(onPressA).not.toHaveBeenCalled();
  });
});
