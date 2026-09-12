import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { Text as RNText } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import {
  type WidgetDefinition,
  WidgetManager,
  type WidgetManagerPickerSurface,
} from './WidgetManager';

const wrap = (ui: ReactElement) => render(<GnomeProvider colorScheme="light">{ui}</GnomeProvider>);

const catalog: WidgetDefinition[] = [
  {
    id: 'clock',
    label: 'Clock',
    description: 'Shows the current time',
    render: () => <RNText>12:00</RNText>,
  },
  { id: 'weather', label: 'Weather', render: () => <RNText>Sunny</RNText> },
];

describe('WidgetManager', () => {
  it('shows the empty state and no trigger when not editing and value is empty', async () => {
    await wrap(<WidgetManager title="My Card" catalog={catalog} value={[]} onChange={jest.fn()} />);

    expect(screen.getByText('No widgets added')).toBeOnTheScreen();
    expect(screen.queryByText('Add Widget')).toBeNull();
  });

  it('shows only the trigger (no empty message) once edit mode is toggled', async () => {
    await wrap(<WidgetManager title="My Card" catalog={catalog} value={[]} onChange={jest.fn()} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Edit widgets' }));

    expect(screen.getByText('Add Widget')).toBeOnTheScreen();
    expect(screen.queryByText('No widgets added')).toBeNull();
  });

  it('renders added widgets and hides the trigger when not editing', async () => {
    await wrap(
      <WidgetManager title="My Card" catalog={catalog} value={['clock']} onChange={jest.fn()} />,
    );

    expect(screen.getByText('Clock')).toBeOnTheScreen();
    expect(screen.getByText('12:00')).toBeOnTheScreen();
    expect(screen.queryByText('Add Widget')).toBeNull();
  });

  it('renders added widgets alongside the trigger when editing', async () => {
    await wrap(
      <WidgetManager title="My Card" catalog={catalog} value={['clock']} onChange={jest.fn()} />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Edit widgets' }));

    expect(screen.getByText('Clock')).toBeOnTheScreen();
    expect(screen.getByText('Add Widget')).toBeOnTheScreen();
  });

  it('ignores a value id that has no match in the catalog', async () => {
    await wrap(
      <WidgetManager
        title="My Card"
        catalog={catalog}
        value={['ghost', 'clock']}
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByText('Clock')).toBeOnTheScreen();
    expect(screen.queryByText('ghost')).toBeNull();
  });

  it('opens the picker with an empty catalog without crashing', async () => {
    await wrap(<WidgetManager title="My Card" catalog={[]} value={[]} onChange={jest.fn()} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Edit widgets' }));
    await fireEvent.press(screen.getByText('Add Widget'));

    expect(screen.getByRole('dialog')).toBeOnTheScreen();
  });

  describe.each<WidgetManagerPickerSurface>([
    'dialog',
    'bottomSheet',
    'drawer',
  ])('picker surface: %s', (pickerSurface) => {
    async function openPicker(value: string[] = []) {
      const onChange = jest.fn();

      await wrap(
        <WidgetManager
          title="My Card"
          catalog={catalog}
          value={value}
          onChange={onChange}
          pickerSurface={pickerSurface}
        />,
      );

      await fireEvent.press(screen.getByRole('button', { name: 'Edit widgets' }));
      await fireEvent.press(screen.getByText('Add Widget'));

      return { onChange };
    }

    it('shows the catalog with Add/Remove labels matching the current value', async () => {
      await openPicker(['clock']);

      expect(screen.getByText('Widgets')).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Remove' })).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Add' })).toBeOnTheScreen();
    });

    it('toggling Add to Remove does not call onChange until confirmed', async () => {
      const { onChange } = await openPicker([]);

      await fireEvent.press(screen.getAllByRole('button', { name: 'Add' })[0]);

      expect(screen.getAllByRole('button', { name: 'Remove' })[0]).toBeOnTheScreen();
      expect(onChange).not.toHaveBeenCalled();
    });

    it('canceling discards staged changes', async () => {
      const { onChange } = await openPicker([]);

      await fireEvent.press(screen.getAllByRole('button', { name: 'Add' })[0]);
      await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));

      expect(onChange).not.toHaveBeenCalled();

      // Reopening must reflect the original value, not the discarded staging
      // — whether the picker surface itself has already finished unmounting
      // (immediate for `dialog`/`drawer`, animated for `bottomSheet`) isn't
      // this component's own contract to re-verify here.
      await fireEvent.press(screen.getByText('Add Widget'));
      expect(screen.getAllByRole('button', { name: 'Add' })).toHaveLength(2);
    });

    it('confirming calls onChange with the staged ids', async () => {
      const { onChange } = await openPicker(['clock']);

      await fireEvent.press(screen.getByRole('button', { name: 'Remove' })); // un-stage clock
      // Both rows show "Add" now (clock un-staged, weather never staged) —
      // clock is first in the catalog, so weather's is the second "Add".
      await fireEvent.press(screen.getAllByRole('button', { name: 'Add' })[1]); // stage weather
      await fireEvent.press(screen.getByRole('button', { name: 'Accept' }));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(['weather']);
    });
  });
});
