import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { TabBar } from './TabBar';
import { TabItem } from './TabItem';
import { TabPanel } from './TabPanel';

describe('Tabs', () => {
  describe('TabBar + TabItem', () => {
    it('renders a tablist with tabs', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <TabBar accessibilityLabel="Primary sections">
            <TabItem label="General" active />
            <TabItem label="Advanced" />
          </TabBar>
        </GnomeProvider>,
      );

      expect(screen.getByRole('tablist', { name: 'Primary sections' })).toBeOnTheScreen();
      expect(screen.getByRole('tab', { name: 'General' }).props.accessibilityState).toMatchObject({
        selected: true,
      });
      expect(screen.getByRole('tab', { name: 'Advanced' }).props.accessibilityState).toMatchObject({
        selected: false,
      });
    });

    it('calls onPress when a tab is pressed', async () => {
      const onPress = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <TabBar>
            <TabItem label="General" active onPress={onPress} />
          </TabBar>
        </GnomeProvider>,
      );

      await fireEvent.press(screen.getByRole('tab', { name: 'General' }));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('reflects disabled in accessibilityState', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <TabBar>
            <TabItem label="Advanced" disabled />
          </TabBar>
        </GnomeProvider>,
      );

      expect(screen.getByRole('tab', { name: 'Advanced' }).props.accessibilityState).toMatchObject({
        disabled: true,
      });
    });

    it('calls tab press and close handlers independently', async () => {
      const onPress = jest.fn();
      const onClose = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <TabBar>
            <TabItem label="Document" active onPress={onPress} onClose={onClose} />
          </TabBar>
        </GnomeProvider>,
      );

      await fireEvent.press(screen.getByRole('button', { name: 'Close tab' }));

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onPress).not.toHaveBeenCalled();
    });

    it('renders a count badge, capped at "99+"', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <TabBar>
            <TabItem label="Inbox" count={5} />
            <TabItem label="Spam" count={150} />
          </TabBar>
        </GnomeProvider>,
      );

      expect(screen.getByText('5')).toBeOnTheScreen();
      expect(screen.getByText('99+')).toBeOnTheScreen();
    });
  });

  describe('TabPanel', () => {
    it('renders visible when active', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <TabPanel active testID="panel">
            <Text>General content</Text>
          </TabPanel>
        </GnomeProvider>,
      );

      expect(screen.getByText('General content')).toBeOnTheScreen();
      expect(screen.getByTestId('panel')).toHaveStyle({ display: 'flex' });
    });

    it('stays mounted but hidden when inactive', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <TabPanel testID="panel">
            <Text>Advanced content</Text>
          </TabPanel>
        </GnomeProvider>,
      );

      expect(screen.getByText('Advanced content', { includeHiddenElements: true })).toBeTruthy();
      expect(screen.getByTestId('panel', { includeHiddenElements: true })).toHaveStyle({
        display: 'none',
      });
    });
  });
});
