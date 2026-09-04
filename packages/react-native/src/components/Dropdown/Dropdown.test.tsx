import { fireEvent, render, screen } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { Dropdown, type DropdownOption } from './Dropdown';

const OPTIONS: DropdownOption[] = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green', description: 'A calm accent' },
  { value: 'red', label: 'Red', disabled: true },
];

describe('Dropdown', () => {
  it('shows the placeholder when nothing is selected', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Dropdown options={OPTIONS} placeholder="Pick a color" />
      </GnomeProvider>,
    );

    expect(screen.getByText('Pick a color')).toBeOnTheScreen();
  });

  it("shows the selected option's label", async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Dropdown options={OPTIONS} value="green" />
      </GnomeProvider>,
    );

    expect(screen.getByText('Green')).toBeOnTheScreen();
  });

  it('is closed until the trigger is pressed', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Dropdown options={OPTIONS} />
      </GnomeProvider>,
    );

    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('opens the option list on trigger press', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Dropdown options={OPTIONS} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));

    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(screen.getByRole('combobox').props.accessibilityState.expanded).toBe(true);
  });

  it('invokes onChange with the pressed option and closes the list', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Dropdown options={OPTIONS} onChange={onChange} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));
    await fireEvent.press(screen.getByText('Green'));

    expect(onChange).toHaveBeenCalledWith('green');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('does not invoke onChange for a disabled option', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Dropdown options={OPTIONS} onChange={onChange} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));
    await fireEvent.press(screen.getByText('Red'));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders the description for options that have one', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Dropdown options={OPTIONS} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));

    expect(screen.getByText('A calm accent')).toBeOnTheScreen();
  });

  it('marks the selected option via accessibilityState.selected', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Dropdown options={OPTIONS} value="blue" />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));

    const [blue, green] = screen.getAllByRole('option');

    expect(blue.props.accessibilityState.selected).toBe(true);
    expect(green.props.accessibilityState.selected).toBe(false);
  });

  it('closes on backdrop press', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Dropdown options={OPTIONS} testID="dropdown" />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));
    expect(screen.getAllByRole('option')).toHaveLength(3);

    await fireEvent.press(screen.getByTestId('dropdown-backdrop'));

    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('does not open when disabled', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Dropdown options={OPTIONS} disabled />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));

    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });
});
