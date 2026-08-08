import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { type WidgetDefinition, WidgetManager, type WidgetManagerPickerSurface } from './index';

const catalog: WidgetDefinition[] = [
  {
    id: 'clock',
    label: 'Clock',
    description: 'Shows the current time',
    render: () => <div>12:00</div>,
  },
  { id: 'weather', label: 'Weather', render: () => <div>Sunny</div> },
];

describe('WidgetManager', () => {
  it('shows the empty state and no trigger when not editing and value is empty', () => {
    render(<WidgetManager title="My Card" catalog={catalog} value={[]} onChange={vi.fn()} />);

    expect(screen.getByText('No widgets added')).toBeInTheDocument();
    expect(screen.queryByText('Add Widget')).not.toBeInTheDocument();
  });

  it('shows only the trigger (no empty message) once edit mode is toggled', () => {
    render(<WidgetManager title="My Card" catalog={catalog} value={[]} onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit widgets' }));

    expect(screen.getByText('Add Widget')).toBeInTheDocument();
    expect(screen.queryByText('No widgets added')).not.toBeInTheDocument();
  });

  it('renders added widgets and hides the trigger when not editing', () => {
    render(
      <WidgetManager title="My Card" catalog={catalog} value={['clock']} onChange={vi.fn()} />,
    );

    expect(screen.getByText('Clock')).toBeInTheDocument();
    expect(screen.getByText('12:00')).toBeInTheDocument();
    expect(screen.queryByText('Add Widget')).not.toBeInTheDocument();
  });

  it('renders added widgets alongside the trigger when editing', () => {
    render(
      <WidgetManager title="My Card" catalog={catalog} value={['clock']} onChange={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Edit widgets' }));

    expect(screen.getByText('Clock')).toBeInTheDocument();
    expect(screen.getByText('Add Widget')).toBeInTheDocument();
  });

  it('ignores a value id that has no match in the catalog', () => {
    render(
      <WidgetManager
        title="My Card"
        catalog={catalog}
        value={['ghost', 'clock']}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Clock')).toBeInTheDocument();
    expect(screen.queryByText('ghost')).not.toBeInTheDocument();
  });

  it('opens the picker with an empty catalog without crashing', () => {
    render(<WidgetManager title="My Card" catalog={[]} value={[]} onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit widgets' }));
    fireEvent.click(screen.getByText('Add Widget'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  describe.each<WidgetManagerPickerSurface>([
    'modal',
    'bottomSheet',
    'drawer',
  ])('picker surface: %s', (pickerSurface) => {
    function openPicker(value: string[] = []) {
      const onChange = vi.fn();

      render(
        <WidgetManager
          title="My Card"
          catalog={catalog}
          value={value}
          onChange={onChange}
          pickerSurface={pickerSurface}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Edit widgets' }));
      fireEvent.click(screen.getByText('Add Widget'));

      return { onChange };
    }

    it('shows the catalog with Add/Remove labels matching the current value', () => {
      openPicker(['clock']);

      const dialog = screen.getByRole('dialog');

      expect(dialog).toHaveTextContent('Widgets');
      expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('toggling Add to Remove does not call onChange until confirmed', () => {
      const { onChange } = openPicker([]);

      fireEvent.click(screen.getAllByRole('button', { name: 'Add' })[0]);

      expect(screen.getAllByRole('button', { name: 'Remove' })[0]).toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });

    it('canceling discards staged changes', async () => {
      const { onChange } = openPicker([]);

      fireEvent.click(screen.getAllByRole('button', { name: 'Add' })[0]);
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onChange).not.toHaveBeenCalled();
      // Modal/BottomSheet animate out (Drawer unmounts immediately) — wait
      // for the dialog to actually leave the DOM either way.
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

      // Reopening must reflect the original value, not the discarded staging.
      fireEvent.click(screen.getByText('Add Widget'));
      expect(screen.getAllByRole('button', { name: 'Add' })).toHaveLength(2);
    });

    it('confirming calls onChange with the staged ids and closes the picker', async () => {
      const { onChange } = openPicker(['clock']);

      fireEvent.click(screen.getByRole('button', { name: 'Remove' })); // un-stage clock
      // Both rows show "Add" now (clock un-staged, weather never staged) —
      // clock is first in the catalog, so weather's is the second "Add".
      fireEvent.click(screen.getAllByRole('button', { name: 'Add' })[1]); // stage weather
      fireEvent.click(screen.getByRole('button', { name: 'Accept' }));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(['weather']);
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('dismissing with Escape behaves like canceling', () => {
      const { onChange } = openPicker([]);

      fireEvent.click(screen.getAllByRole('button', { name: 'Add' })[0]);
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
