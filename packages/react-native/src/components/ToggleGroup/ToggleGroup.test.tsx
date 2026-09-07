import { FormatJustifyCenter, FormatJustifyLeft } from '@gnome-ui/icons';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { type ComponentProps, createRef } from 'react';
import type { View } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { ToggleGroup } from './ToggleGroup';
import { ToggleGroupItem } from './ToggleGroupItem';

const renderGroup = (
  ui: ComponentProps<typeof GnomeProvider>['children'],
  colorScheme: 'light' | 'dark' = 'light',
) => render(<GnomeProvider colorScheme={colorScheme}>{ui}</GnomeProvider>);

const Group = ({
  value = 'left',
  onValueChange = () => {},
  ...rest
}: Partial<ComponentProps<typeof ToggleGroup>>) => (
  <ToggleGroup value={value} onValueChange={onValueChange} {...rest}>
    <ToggleGroupItem name="left" label="Left" />
    <ToggleGroupItem name="center" label="Center" />
    <ToggleGroupItem name="right" label="Right" disabled />
  </ToggleGroup>
);

describe('ToggleGroup', () => {
  it('renders every item', async () => {
    await renderGroup(<Group />);

    expect(screen.getByText('Left')).toBeOnTheScreen();
    expect(screen.getByText('Center')).toBeOnTheScreen();
    expect(screen.getByText('Right')).toBeOnTheScreen();
  });

  // The group is deliberately not `accessible` — that would collapse the whole
  // subtree into one element on iOS and make the toggles unreachable — so the
  // role is asserted on the props rather than through getByRole, which only
  // matches accessible elements.
  it('exposes the group as a radiogroup with a default label', async () => {
    await renderGroup(<Group testID="group" />);
    const group = screen.getByTestId('group');

    expect(group.props.accessibilityRole).toBe('radiogroup');
    expect(group.props.accessibilityLabel).toBe('Options');
  });

  it('accepts a custom group label', async () => {
    await renderGroup(<Group testID="group" accessibilityLabel="Alignment" />);

    expect(screen.getByTestId('group').props.accessibilityLabel).toBe('Alignment');
  });

  it('leaves every item individually focusable', async () => {
    await renderGroup(<Group testID="group" />);

    expect(screen.getByTestId('group').props.accessible).toBeFalsy();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  describe('selection', () => {
    it('marks only the active item as checked', async () => {
      await renderGroup(<Group value="center" />);

      expect(screen.getByRole('radio', { name: 'Left' }).props.accessibilityState.checked).toBe(
        false,
      );
      expect(screen.getByRole('radio', { name: 'Center' }).props.accessibilityState.checked).toBe(
        true,
      );
    });

    it('calls onValueChange with the pressed item name', async () => {
      const onValueChange = jest.fn();
      await renderGroup(<Group value="left" onValueChange={onValueChange} />);

      fireEvent.press(screen.getByRole('radio', { name: 'Center' }));

      expect(onValueChange).toHaveBeenCalledWith('center');
    });

    it('still reports the press when the active item is pressed again', async () => {
      const onValueChange = jest.fn();
      await renderGroup(<Group value="left" onValueChange={onValueChange} />);

      fireEvent.press(screen.getByRole('radio', { name: 'Left' }));

      expect(onValueChange).toHaveBeenCalledWith('left');
    });
  });

  describe('disabled items', () => {
    it('reports the disabled state', async () => {
      await renderGroup(<Group />);

      expect(screen.getByRole('radio', { name: 'Right' }).props.accessibilityState.disabled).toBe(
        true,
      );
    });

    it('does not report a value change', async () => {
      const onValueChange = jest.fn();
      await renderGroup(<Group onValueChange={onValueChange} />);

      fireEvent.press(screen.getByRole('radio', { name: 'Right' }));

      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('items', () => {
    it('names an icon-only item from accessibilityLabel', async () => {
      await renderGroup(
        <ToggleGroup value="left" onValueChange={() => {}}>
          <ToggleGroupItem name="left" icon={FormatJustifyLeft} accessibilityLabel="Left align" />
        </ToggleGroup>,
      );

      expect(screen.getByRole('radio', { name: 'Left align' })).toBeOnTheScreen();
    });

    it('gives an icon-only item a square minimum size', async () => {
      await renderGroup(
        <ToggleGroup value="left" onValueChange={() => {}}>
          <ToggleGroupItem
            testID="icon-only"
            name="left"
            icon={FormatJustifyLeft}
            accessibilityLabel="Left align"
          />
          <ToggleGroupItem testID="labelled" name="center" icon={FormatJustifyCenter} label="Mid" />
        </ToggleGroup>,
      );

      expect(screen.getByTestId('icon-only')).toHaveStyle({ minWidth: 28, minHeight: 28 });
      expect(screen.getByTestId('labelled')).toHaveStyle({ minWidth: undefined });
    });

    it('tints the active item with the accent color', async () => {
      await renderGroup(
        <ToggleGroup value="left" onValueChange={() => {}}>
          <ToggleGroupItem testID="active" name="left" label="Left" />
          <ToggleGroupItem testID="idle" name="center" label="Center" />
        </ToggleGroup>,
      );

      // color-mix(accent 15%, transparent) → 8-digit hex, the Chip precedent.
      expect(screen.getByTestId('active')).toHaveStyle({ backgroundColor: '#3584e426' });
      expect(screen.getByTestId('idle')).toHaveStyle({ backgroundColor: 'transparent' });
    });

    it('uses the heavier dark-scheme tint', async () => {
      await renderGroup(
        <ToggleGroup value="left" onValueChange={() => {}}>
          <ToggleGroupItem testID="active" name="left" label="Left" />
        </ToggleGroup>,
        'dark',
      );

      expect(screen.getByTestId('active')).toHaveStyle({ backgroundColor: '#3584e440' });
    });

    it('keeps a transparent border on inactive items so selecting never shifts layout', async () => {
      await renderGroup(
        <ToggleGroup value="left" onValueChange={() => {}}>
          <ToggleGroupItem testID="idle" name="center" label="Center" />
        </ToggleGroup>,
      );

      expect(screen.getByTestId('idle')).toHaveStyle({
        borderWidth: 1,
        borderColor: 'transparent',
      });
    });

    it('throws when used outside a ToggleGroup', async () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(renderGroup(<ToggleGroupItem name="orphan" label="Orphan" />)).rejects.toThrow(
        'ToggleGroupItem must be used inside ToggleGroup',
      );

      spy.mockRestore();
    });
  });

  describe('prop forwarding', () => {
    it('merges a custom style over the group', async () => {
      await renderGroup(<Group style={{ marginTop: 8 }} testID="group" />);

      expect(screen.getByTestId('group')).toHaveStyle({ marginTop: 8 });
    });

    it('forwards a ref to the underlying View', async () => {
      const ref = createRef<View>();
      await renderGroup(<Group ref={ref} />);

      expect(ref.current).not.toBeNull();
    });
  });
});
