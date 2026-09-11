import { fireEvent, render, screen } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { MultiSelectDropdown, type MultiSelectDropdownOption } from './MultiSelectDropdown';

const OPTIONS: MultiSelectDropdownOption[] = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green', description: 'A calm accent' },
  { value: 'red', label: 'Red', disabled: true },
];

describe('MultiSelectDropdown', () => {
  it('shows the placeholder when nothing is selected', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <MultiSelectDropdown
          options={OPTIONS}
          value={[]}
          onChange={() => {}}
          placeholder="Pick colors"
        />
      </GnomeProvider>,
    );

    expect(screen.getByText('Pick colors')).toBeOnTheScreen();
  });

  it("shows the single selected option's label", async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <MultiSelectDropdown options={OPTIONS} value={['green']} onChange={() => {}} />
      </GnomeProvider>,
    );

    expect(screen.getByText('Green')).toBeOnTheScreen();
  });

  it('summarizes multiple selections with a count', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <MultiSelectDropdown options={OPTIONS} value={['blue', 'green']} onChange={() => {}} />
      </GnomeProvider>,
    );

    expect(screen.getByText('2 selected')).toBeOnTheScreen();
  });

  it('is closed until the trigger is pressed', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <MultiSelectDropdown options={OPTIONS} value={[]} onChange={() => {}} />
      </GnomeProvider>,
    );

    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('opens the option list on trigger press', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <MultiSelectDropdown options={OPTIONS} value={[]} onChange={() => {}} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));

    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(screen.getByRole('combobox').props.accessibilityState.expanded).toBe(true);
  });

  it('toggles an option on and keeps the list open', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <MultiSelectDropdown options={OPTIONS} value={[]} onChange={onChange} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));
    await fireEvent.press(screen.getByText('Green'));

    expect(onChange).toHaveBeenCalledWith(['green']);
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('toggles an already-selected option off', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <MultiSelectDropdown options={OPTIONS} value={['blue', 'green']} onChange={onChange} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));
    await fireEvent.press(screen.getByText('Green'));

    expect(onChange).toHaveBeenCalledWith(['blue']);
  });

  it('does not invoke onChange for a disabled option', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <MultiSelectDropdown options={OPTIONS} value={[]} onChange={onChange} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));
    await fireEvent.press(screen.getByText('Red'));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders the description for options that have one', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <MultiSelectDropdown options={OPTIONS} value={[]} onChange={() => {}} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));

    expect(screen.getByText('A calm accent')).toBeOnTheScreen();
  });

  it('marks selected options via accessibilityState.selected', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <MultiSelectDropdown options={OPTIONS} value={['blue']} onChange={() => {}} />
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
        <MultiSelectDropdown options={OPTIONS} value={[]} onChange={() => {}} testID="msd" />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));
    expect(screen.getAllByRole('option')).toHaveLength(3);

    await fireEvent.press(screen.getByTestId('msd-backdrop'));

    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('does not open when disabled', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <MultiSelectDropdown options={OPTIONS} value={[]} onChange={() => {}} disabled />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));

    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });
});
