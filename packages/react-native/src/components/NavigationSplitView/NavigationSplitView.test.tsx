import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text, useWindowDimensions } from 'react-native';

import { NavigationSplitView } from './NavigationSplitView';

// Mutating the one export in place (not `{...RN}`) — react-native's own
// module object exposes several properties (e.g. `DevMenu`,
// `ProgressBarAndroid`) as lazy getters that crash outside a real native
// runtime the moment they're *accessed*, which a spread does to every
// property immediately. Direct assignment touches only the one export
// this test needs to control.
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  Object.defineProperty(RN, 'useWindowDimensions', {
    value: jest.fn(),
    configurable: true,
    writable: true,
  });

  return RN;
});

const mockUseWindowDimensions = useWindowDimensions as jest.Mock;

function setWidth(width: number) {
  mockUseWindowDimensions.mockReturnValue({ width, height: 800, scale: 1, fontScale: 1 });
}

const layout = (width: number) => ({
  nativeEvent: { layout: { x: 0, y: 0, width, height: 800 } },
});

describe('NavigationSplitView', () => {
  beforeEach(() => {
    setWidth(1024);
  });

  describe('wide layout (> 400dp)', () => {
    it('renders both sidebar and content panes visible', async () => {
      await render(
        <NavigationSplitView
          sidebar={<Text>Sidebar pane</Text>}
          content={<Text>Content pane</Text>}
        />,
      );

      expect(screen.getByText('Sidebar pane')).toBeOnTheScreen();
      expect(screen.getByText('Content pane')).toBeOnTheScreen();
    });

    it('renders a divider between the panes', async () => {
      await render(
        <NavigationSplitView
          sidebar={<Text>Sidebar</Text>}
          content={<Text>Content</Text>}
          testID="nav"
        />,
      );

      expect(screen.getByTestId('nav-divider')).toBeOnTheScreen();
    });

    it('ignores showContent on wide screens — both panes stay visible', async () => {
      await render(
        <NavigationSplitView
          showContent
          sidebar={<Text testID="sidebar-content">Sidebar pane</Text>}
          content={<Text>Content pane</Text>}
        />,
      );

      const sidebarPane = screen.getByTestId('sidebar-content').parent;

      expect(sidebarPane?.props.accessibilityElementsHidden).toBeFalsy();
    });
  });

  describe('narrow layout (<= 400dp)', () => {
    beforeEach(() => {
      setWidth(400);
    });

    it('shows the sidebar and hides content when showContent is false', async () => {
      await render(
        <NavigationSplitView
          showContent={false}
          sidebar={<Text testID="sidebar-inner">Sidebar pane</Text>}
          content={<Text testID="content-inner">Content pane</Text>}
        />,
      );

      const sidebarPane = screen.getByTestId('sidebar-inner').parent;
      const contentPane = screen.getByTestId('content-inner', { includeHiddenElements: true })
        .parent;

      expect(sidebarPane?.props.accessibilityElementsHidden).toBeFalsy();
      expect(contentPane?.props.accessibilityElementsHidden).toBe(true);
      expect(contentPane?.props.importantForAccessibility).toBe('no-hide-descendants');
      expect(contentPane?.props.pointerEvents).toBe('none');
    });

    it('shows the content and hides the sidebar when showContent is true', async () => {
      await render(
        <NavigationSplitView
          showContent
          sidebar={<Text testID="sidebar-inner">Sidebar pane</Text>}
          content={<Text testID="content-inner">Content pane</Text>}
        />,
      );

      const sidebarPane = screen.getByTestId('sidebar-inner', { includeHiddenElements: true })
        .parent;
      const contentPane = screen.getByTestId('content-inner').parent;

      expect(sidebarPane?.props.accessibilityElementsHidden).toBe(true);
      expect(sidebarPane?.props.importantForAccessibility).toBe('no-hide-descendants');
      expect(sidebarPane?.props.pointerEvents).toBe('none');
      expect(contentPane?.props.accessibilityElementsHidden).toBeFalsy();
    });

    it('omits the divider', async () => {
      await render(
        <NavigationSplitView
          sidebar={<Text>Sidebar</Text>}
          content={<Text>Content</Text>}
          testID="nav"
        />,
      );

      expect(screen.queryByTestId('nav-divider')).not.toBeOnTheScreen();
    });
  });

  describe('sidebar width', () => {
    it('clamps to minSidebarWidth when the fraction would be smaller', async () => {
      await render(
        <NavigationSplitView
          sidebar={<Text testID="sidebar-inner">Sidebar</Text>}
          content={<Text>Content</Text>}
          testID="nav"
          minSidebarWidth={200}
          maxSidebarWidth={300}
          sidebarWidthFraction={0.25}
        />,
      );

      await fireEvent(screen.getByTestId('nav'), 'layout', layout(600));

      const sidebarPane = screen.getByTestId('sidebar-inner').parent;

      expect(sidebarPane?.props.style).toMatchObject({ width: 200 });
    });

    it('clamps to maxSidebarWidth when the fraction would be larger', async () => {
      await render(
        <NavigationSplitView
          sidebar={<Text testID="sidebar-inner">Sidebar</Text>}
          content={<Text>Content</Text>}
          testID="nav"
          minSidebarWidth={200}
          maxSidebarWidth={300}
          sidebarWidthFraction={0.25}
        />,
      );

      await fireEvent(screen.getByTestId('nav'), 'layout', layout(2000));

      const sidebarPane = screen.getByTestId('sidebar-inner').parent;

      expect(sidebarPane?.props.style).toMatchObject({ width: 300 });
    });

    it('uses the fraction of the measured width when within bounds', async () => {
      await render(
        <NavigationSplitView
          sidebar={<Text testID="sidebar-inner">Sidebar</Text>}
          content={<Text>Content</Text>}
          testID="nav"
          minSidebarWidth={100}
          maxSidebarWidth={400}
          sidebarWidthFraction={0.3}
        />,
      );

      await fireEvent(screen.getByTestId('nav'), 'layout', layout(1000));

      const sidebarPane = screen.getByTestId('sidebar-inner').parent;

      expect(sidebarPane?.props.style).toMatchObject({ width: 300 });
    });
  });

  describe('prop forwarding', () => {
    it('forwards testID to the root container', async () => {
      await render(
        <NavigationSplitView
          sidebar={<Text>Sidebar</Text>}
          content={<Text>Content</Text>}
          testID="nav"
        />,
      );

      expect(screen.getByTestId('nav')).toBeOnTheScreen();
    });

    it('merges a forwarded style with its own', async () => {
      await render(
        <NavigationSplitView
          sidebar={<Text>Sidebar</Text>}
          content={<Text>Content</Text>}
          testID="nav"
          style={{ backgroundColor: 'red' }}
        />,
      );

      expect(screen.getByTestId('nav')).toHaveStyle({ backgroundColor: 'red', width: '100%' });
    });
  });
});
