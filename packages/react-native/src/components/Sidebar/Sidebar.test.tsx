import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { createRef } from 'react';

import { GnomeProvider } from '@/GnomeProvider';
import { Sidebar } from './Sidebar';
import { SidebarItem } from './SidebarItem';
import { SidebarSection, type SidebarSectionHandle } from './SidebarSection';

describe('Sidebar', () => {
  it('renders SidebarItem rows with labels', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Sidebar>
          <SidebarItem label="General" active />
          <SidebarItem label="Advanced" />
        </Sidebar>
      </GnomeProvider>,
    );

    expect(screen.getByText('General')).toBeOnTheScreen();
    expect(screen.getByText('Advanced')).toBeOnTheScreen();
  });

  it('reflects active in accessibilityState and calls onPress', async () => {
    const onPress = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Sidebar>
          <SidebarItem label="General" active onPress={onPress} />
        </Sidebar>
      </GnomeProvider>,
    );

    const row = screen.getByRole('button', { name: 'General' });
    expect(row.props.accessibilityState).toMatchObject({ selected: true });

    await fireEvent.press(row);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('reflects disabled in accessibilityState', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Sidebar>
          <SidebarItem label="Locked" disabled />
        </Sidebar>
      </GnomeProvider>,
    );

    expect(screen.getByRole('button', { name: 'Locked' }).props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  it('hides an item whose label does not match an active filter', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Sidebar filter="gen">
          <SidebarItem label="General" />
          <SidebarItem label="Advanced" />
        </Sidebar>
      </GnomeProvider>,
    );

    expect(screen.getByText('General')).toBeOnTheScreen();
    expect(screen.queryByText('Advanced')).not.toBeOnTheScreen();
  });

  it('does not reserve a divider slot for a filtered-out item', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Sidebar filter="ban">
          <SidebarItem label="Apples" />
          <SidebarItem label="Bananas" />
          <SidebarItem label="Cherries" />
        </Sidebar>
      </GnomeProvider>,
    );

    expect(screen.getByText('Bananas')).toBeOnTheScreen();
    expect(screen.queryAllByTestId('sidebar-separator')).toHaveLength(0);
  });

  it('shows a no-results message when nothing matches the filter', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Sidebar filter="zzz">
          <SidebarItem label="General" />
        </Sidebar>
      </GnomeProvider>,
    );

    expect(screen.getByText('No items match your search.')).toBeOnTheScreen();
    expect(screen.queryByText('General')).not.toBeOnTheScreen();
  });

  it('hides the label in collapsed mode but keeps it as the accessible name', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Sidebar collapsed>
          <SidebarItem label="General" />
        </Sidebar>
      </GnomeProvider>,
    );

    expect(screen.queryByText('General')).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'General' })).toBeOnTheScreen();
  });

  describe('SidebarSection', () => {
    it('renders a titled group of items', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Sidebar>
            <SidebarSection title="Views">
              <SidebarItem label="Inbox" />
            </SidebarSection>
          </Sidebar>
        </GnomeProvider>,
      );

      expect(screen.getByText('Views')).toBeOnTheScreen();
      expect(screen.getByText('Inbox')).toBeOnTheScreen();
    });

    it('toggles the body when a collapsible header is pressed', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Sidebar>
            <SidebarSection title="Views" collapsible defaultOpen>
              <SidebarItem label="Inbox" />
            </SidebarSection>
          </Sidebar>
        </GnomeProvider>,
      );

      const list = screen.getByRole('list', { includeHiddenElements: true });
      expect(list).toHaveStyle({ display: 'flex' });

      await fireEvent.press(screen.getByRole('button', { name: 'Views' }));
      expect(list).toHaveStyle({ display: 'none' });
    });

    it('exposes expand/collapse/toggle via ref', async () => {
      const ref = createRef<SidebarSectionHandle>();

      await render(
        <GnomeProvider colorScheme="light">
          <Sidebar>
            <SidebarSection title="Views" collapsible defaultOpen={false} ref={ref}>
              <SidebarItem label="Inbox" />
            </SidebarSection>
          </Sidebar>
        </GnomeProvider>,
      );

      const list = screen.getByRole('list', { includeHiddenElements: true });
      expect(list).toHaveStyle({ display: 'none' });

      await act(async () => ref.current?.expand());
      expect(list).toHaveStyle({ display: 'flex' });
    });

    it('hides a section entirely when no descendant matches the filter', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Sidebar filter="zzz">
            <SidebarSection title="Views">
              <SidebarItem label="Inbox" />
            </SidebarSection>
          </Sidebar>
        </GnomeProvider>,
      );

      expect(screen.queryByText('Views')).not.toBeOnTheScreen();
    });
  });
});
