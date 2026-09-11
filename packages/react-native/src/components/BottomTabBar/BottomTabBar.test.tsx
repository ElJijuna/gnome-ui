import { Check, Person, Search } from '@gnome-ui/icons';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { lightTheme } from '@/theme';
import { BottomTabBar, type BottomTabBarItem } from './BottomTabBar';

/** No public RNTL query reaches a decorative (`role="none"`) `Icon`'s underlying `Svg` — walk the raw test-instance tree by host component name instead. */
const findSvg = (root: ReturnType<typeof screen.getByTestId>) => {
  const [svg] = root.queryAll((instance) => instance.type === 'RNSVGSvgView');

  return svg;
};

const ITEMS: BottomTabBarItem[] = [
  { value: 'home', label: 'Home', icon: Search },
  { value: 'search', label: 'Search', icon: Search, activeIcon: Check },
  { value: 'profile', label: 'Profile', icon: Person, badge: true },
];

describe('BottomTabBar', () => {
  it('renders a tablist with a tab per item', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <BottomTabBar items={ITEMS} value="home" onChange={() => {}} />
      </GnomeProvider>,
    );

    expect(screen.getByRole('tablist')).toBeOnTheScreen();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('marks the selected tab via accessibilityState', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <BottomTabBar items={ITEMS} value="search" onChange={() => {}} />
      </GnomeProvider>,
    );

    expect(screen.getByRole('tab', { name: 'Home' }).props.accessibilityState.selected).toBe(false);
    expect(screen.getByRole('tab', { name: 'Search' }).props.accessibilityState.selected).toBe(
      true,
    );
  });

  it('calls onChange with the pressed tab value', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <BottomTabBar items={ITEMS} value="home" onChange={onChange} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('tab', { name: 'Profile' }));

    expect(onChange).toHaveBeenCalledWith('profile');
  });

  it('does not call onChange for a disabled tab', async () => {
    const onChange = jest.fn();
    const items: BottomTabBarItem[] = [
      { value: 'home', label: 'Home', icon: Search },
      { value: 'locked', label: 'Locked', icon: Person, disabled: true },
    ];

    await render(
      <GnomeProvider colorScheme="light">
        <BottomTabBar items={items} value="home" onChange={onChange} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('tab', { name: 'Locked' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('tab', { name: 'Locked' }).props.accessibilityState.disabled).toBe(
      true,
    );
  });

  it('tints only the selected tab icon with the theme accent color', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <BottomTabBar items={ITEMS} value="home" onChange={() => {}} testID="bar" />
      </GnomeProvider>,
    );

    const homeSvg = findSvg(screen.getByTestId('bar-home'));
    const searchSvg = findSvg(screen.getByTestId('bar-search'));

    expect(homeSvg.props.fill).toBe(lightTheme.accentColor);
    expect(searchSvg.props.fill).toBe(lightTheme.windowFgColor);
  });

  it('swaps in activeIcon for the selected tab when provided', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <BottomTabBar items={ITEMS} value="search" onChange={() => {}} testID="bar" />
      </GnomeProvider>,
    );

    // `search`'s activeIcon is `Check`, a visually distinct path from its `icon` (`Search`).
    const svg = findSvg(screen.getByTestId('bar-search'));
    const [path] = svg.queryAll((instance) => instance.type === 'RNSVGPath');

    expect(path.props.d).toBe(Check.paths![0].d);
  });

  it('renders a badge dot for boolean badge:true', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <BottomTabBar items={ITEMS} value="home" onChange={() => {}} testID="bar" />
      </GnomeProvider>,
    );

    expect(within(screen.getByTestId('bar-profile')).getByTestId('badge')).toBeOnTheScreen();
  });

  it('renders a numeric badge, capping the display at 99+', async () => {
    const items: BottomTabBarItem[] = [
      { value: 'inbox', label: 'Inbox', icon: Search, badge: 150 },
    ];

    await render(
      <GnomeProvider colorScheme="light">
        <BottomTabBar items={items} value="inbox" onChange={() => {}} />
      </GnomeProvider>,
    );

    expect(screen.getByText('99+')).toBeOnTheScreen();
  });

  it('renders the exact count when 99 or below', async () => {
    const items: BottomTabBarItem[] = [{ value: 'inbox', label: 'Inbox', icon: Search, badge: 3 }];

    await render(
      <GnomeProvider colorScheme="light">
        <BottomTabBar items={items} value="inbox" onChange={() => {}} />
      </GnomeProvider>,
    );

    expect(screen.getByText('3')).toBeOnTheScreen();
  });

  it('adds bottomInset on top of the base bottom padding', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <BottomTabBar
          items={ITEMS}
          value="home"
          onChange={() => {}}
          bottomInset={20}
          testID="bar"
        />
      </GnomeProvider>,
    );

    expect(StyleSheet.flatten(screen.getByTestId('bar').props.style).paddingBottom).toBe(24);
  });
});
