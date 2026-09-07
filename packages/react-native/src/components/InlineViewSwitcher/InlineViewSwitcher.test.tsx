import { Applications, ViewSidebar } from '@gnome-ui/icons';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { type ComponentProps, createRef } from 'react';
import type { View } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { InlineViewSwitcher } from './InlineViewSwitcher';
import { InlineViewSwitcherItem } from './InlineViewSwitcherItem';

const renderSwitcher = (
  ui: ComponentProps<typeof GnomeProvider>['children'],
  colorScheme: 'light' | 'dark' = 'light',
) => render(<GnomeProvider colorScheme={colorScheme}>{ui}</GnomeProvider>);

const Switcher = (props: Partial<ComponentProps<typeof InlineViewSwitcher>>) => (
  <InlineViewSwitcher value="grid" onValueChange={() => {}} {...props}>
    <InlineViewSwitcherItem name="grid" label="Grid" icon={Applications} />
    <InlineViewSwitcherItem name="list" label="List" icon={ViewSidebar} />
    {/* No icon: proves compact only collapses labels an icon can stand in for. */}
    <InlineViewSwitcherItem name="table" label="Table" />
  </InlineViewSwitcher>
);

/**
 * Separate fixture for the disabled case: Testing Library refuses to fire
 * *any* event — `layout` included — on a disabled element, so a disabled
 * item in the shared fixture would silently never report its measurement.
 */
const WithDisabled = (props: Partial<ComponentProps<typeof InlineViewSwitcher>>) => (
  <InlineViewSwitcher value="grid" onValueChange={() => {}} {...props}>
    <InlineViewSwitcherItem name="grid" label="Grid" />
    <InlineViewSwitcherItem name="table" label="Table" disabled />
  </InlineViewSwitcher>
);

/**
 * Fakes the measurement pass the items and the row do through `onLayout`.
 *
 * The fires have to sit inside an **async** `act`: `fireEvent`'s own act is
 * synchronous, which doesn't settle the work React 19 schedules off these
 * state updates — leaving an act scope open that makes the *next* test's
 * render come back empty.
 */
const measureAll = (width: number) =>
  act(async () => {
    ['Grid', 'List', 'Table'].forEach((name, index) =>
      fireEvent(screen.getByRole('radio', { name }), 'layout', {
        nativeEvent: { layout: { x: 4 + index * (width + 2), y: 0, width, height: 28 } },
      }),
    );
  });

/** The "available width" half of the overflow comparison. */
const layoutRow = (testID: string, width: number) =>
  act(async () => {
    fireEvent(screen.getByTestId(testID), 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width, height: 32 } },
    });
  });

describe('InlineViewSwitcher', () => {
  it('renders every item', async () => {
    await renderSwitcher(<Switcher />);

    expect(screen.getByText('Grid')).toBeOnTheScreen();
    expect(screen.getByText('List')).toBeOnTheScreen();
    expect(screen.getByText('Table')).toBeOnTheScreen();
  });

  it('exposes the group as a radiogroup without swallowing the items', async () => {
    await renderSwitcher(<Switcher testID="switcher" />);
    const group = screen.getByTestId('switcher');

    expect(group.props.accessibilityRole).toBe('radiogroup');
    expect(group.props.accessibilityLabel).toBe('View switcher');
    expect(group.props.accessible).toBeFalsy();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  describe('selection', () => {
    it('marks only the active item as checked', async () => {
      await renderSwitcher(<Switcher value="list" />);

      expect(screen.getByRole('radio', { name: 'Grid' }).props.accessibilityState.checked).toBe(
        false,
      );
      expect(screen.getByRole('radio', { name: 'List' }).props.accessibilityState.checked).toBe(
        true,
      );
    });

    it('reports the pressed item', async () => {
      const onValueChange = jest.fn();
      await renderSwitcher(<Switcher onValueChange={onValueChange} />);

      fireEvent.press(screen.getByRole('radio', { name: 'List' }));

      expect(onValueChange).toHaveBeenCalledWith('list');
    });

    it('marks a disabled item as disabled and never reports a press', async () => {
      const onValueChange = jest.fn();
      await renderSwitcher(<WithDisabled onValueChange={onValueChange} />);
      const item = screen.getByRole('radio', { name: 'Table' });

      expect(item.props.accessibilityState.disabled).toBe(true);

      fireEvent.press(item);

      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('variants', () => {
    it('paints the default variant with a card surface and border', async () => {
      await renderSwitcher(<Switcher testID="switcher" />);

      expect(screen.getByTestId('switcher')).toHaveStyle({
        backgroundColor: '#fff',
        borderWidth: 1,
      });
    });

    it('leaves the flat variant transparent and border-free', async () => {
      await renderSwitcher(<Switcher testID="switcher" variant="flat" />);
      const group = screen.getByTestId('switcher');

      expect(group).toHaveStyle({ backgroundColor: 'transparent' });
      expect(group.props.style.borderWidth).toBeUndefined();
    });

    it('gives round and pill a pill radius', async () => {
      await renderSwitcher(
        <>
          <Switcher testID="round" variant="round" />
          <Switcher testID="pill" variant="pill" />
        </>,
      );

      expect(screen.getByTestId('round')).toHaveStyle({ borderRadius: 9999 });
      expect(screen.getByTestId('pill')).toHaveStyle({ borderRadius: 9999 });
    });

    it('colors the active label per variant', async () => {
      await renderSwitcher(
        <>
          <Switcher testID="default" />
          <Switcher testID="round" variant="round" />
          <Switcher testID="pill" variant="pill" />
        </>,
      );

      const [defaultLabel, roundLabel, pillLabel] = screen.getAllByText('Grid');

      // default → accent text, round → accent *foreground* on the solid
      // accent indicator, pill → plain foreground (segmented-control look).
      expect(defaultLabel).toHaveStyle({ color: '#3584e4' });
      expect(roundLabel).toHaveStyle({ color: '#fff' });
      expect(pillLabel).toHaveStyle({ color: 'rgba(0, 0, 0, 0.8)' });
    });
  });

  describe('sizing', () => {
    it('hugs its content by default', async () => {
      await renderSwitcher(<Switcher testID="switcher" />);

      expect(screen.getByTestId('switcher')).toHaveStyle({ alignSelf: 'flex-start' });
    });

    it('fills the available width when it has to detect overflow', async () => {
      await renderSwitcher(<Switcher testID="switcher" overflow="compact" />);

      expect(screen.getByTestId('switcher')).toHaveStyle({ width: '100%' });
    });
  });

  // The measurement pass and the overflow effect it feeds land across a
  // couple of React commits, so every assertion after one is a `waitFor`.
  describe('overflow="compact"', () => {
    it('keeps labels while everything fits', async () => {
      await renderSwitcher(<Switcher testID="switcher" overflow="compact" />);

      await measureAll(80);
      await layoutRow('switcher', 400);

      await waitFor(() => expect(screen.getByText('Grid')).toBeOnTheScreen());
      expect(screen.getByText('List')).toBeOnTheScreen();
    });

    it('collapses labels to icons once the items no longer fit', async () => {
      await renderSwitcher(<Switcher testID="switcher" overflow="compact" />);

      await measureAll(120);
      await layoutRow('switcher', 200);

      // Items with an icon lose their label; the icon-less one keeps it.
      await waitFor(() => expect(screen.queryByText('Grid')).toBeNull());
      expect(screen.queryByText('List')).toBeNull();
      expect(screen.getByText('Table')).toBeOnTheScreen();
    });
  });

  describe('overflow="menu"', () => {
    it('stays a normal switcher while everything fits', async () => {
      await renderSwitcher(<Switcher testID="switcher" overflow="menu" />);

      await measureAll(60);
      await layoutRow('switcher', 400);

      await waitFor(() => expect(screen.getAllByRole('radio')).toHaveLength(3));
    });

    it('collapses to a single trigger when the items no longer fit', async () => {
      await renderSwitcher(<Switcher testID="switcher" overflow="menu" />);

      await measureAll(120);
      await layoutRow('switcher', 200);

      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'View switcher: Grid' })).toBeOnTheScreen(),
      );
      expect(screen.queryAllByRole('radio')).toHaveLength(0);
    });

    it('keeps the trigger label readable in every variant', async () => {
      // Regression: `round`'s active color is `accent-fg` (#fff), which the
      // web version applies to the trigger even though menu mode hides the
      // accent indicator behind it — white on white.
      await renderSwitcher(<Switcher testID="switcher" overflow="menu" variant="round" />);

      await measureAll(120);
      await layoutRow('switcher', 200);

      await waitFor(() => expect(screen.getByText('Grid')).toBeOnTheScreen());
      expect(screen.getByText('Grid')).toHaveStyle({ color: 'rgba(0, 0, 0, 0.8)' });
    });

    it('opens the sheet and selects from it', async () => {
      const onValueChange = jest.fn();
      await renderSwitcher(
        <Switcher testID="switcher" overflow="menu" onValueChange={onValueChange} />,
      );

      await measureAll(120);
      await layoutRow('switcher', 200);

      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'View switcher: Grid' })).toBeOnTheScreen(),
      );
      fireEvent.press(screen.getByRole('button', { name: 'View switcher: Grid' }));

      await waitFor(() => expect(screen.getByRole('radio', { name: 'List' })).toBeOnTheScreen());
      fireEvent.press(screen.getByRole('radio', { name: 'List' }));

      expect(onValueChange).toHaveBeenCalledWith('list');
    });
  });

  describe('misc', () => {
    it('forwards a ref to the underlying View', async () => {
      const ref = createRef<View>();
      await renderSwitcher(<Switcher ref={ref} />);

      expect(ref.current).not.toBeNull();
    });
  });

  // Last on purpose: a render that throws leaves RNTL's `screen` detached,
  // which would break every test declared after it. Jest runs a block's own
  // tests before its nested describes, so this has to live in one too.
  describe('context guard', () => {
    it('throws when an item is used outside a switcher', async () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // The IIFE turns a synchronous render throw into a rejected promise,
      // so the assertion holds either way React surfaces it.
      await expect(
        (async () => renderSwitcher(<InlineViewSwitcherItem name="orphan" label="Orphan" />))(),
      ).rejects.toThrow('InlineViewSwitcherItem must be used inside InlineViewSwitcher');

      spy.mockRestore();
    });
  });
});
