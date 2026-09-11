import { fireEvent, render, screen } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { FilterableMultiSelectDropdown } from './FilterableMultiSelectDropdown';

const OPTIONS = [
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'py', label: 'Python', description: 'A general-purpose language' },
  { value: 'cobol', label: 'COBOL', disabled: true },
];

describe('FilterableMultiSelectDropdown', () => {
  it('shows the placeholder when nothing is selected', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <FilterableMultiSelectDropdown
          options={OPTIONS}
          value={[]}
          onChange={() => {}}
          placeholder="Choose languages"
        />
      </GnomeProvider>,
    );

    expect(screen.getByText('Choose languages')).toBeOnTheScreen();
  });

  it("shows the single selected option's label", async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <FilterableMultiSelectDropdown options={OPTIONS} value={['ts']} onChange={() => {}} />
      </GnomeProvider>,
    );

    expect(screen.getByText('TypeScript')).toBeOnTheScreen();
  });

  it('summarizes multiple selections with a count', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <FilterableMultiSelectDropdown options={OPTIONS} value={['js', 'ts']} onChange={() => {}} />
      </GnomeProvider>,
    );

    expect(screen.getByText('2 selected')).toBeOnTheScreen();
  });

  it('opens the option list and filter field on trigger press', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <FilterableMultiSelectDropdown options={OPTIONS} value={[]} onChange={() => {}} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));

    expect(screen.getAllByRole('option')).toHaveLength(4);
    expect(screen.getByPlaceholderText('Filter options…')).toBeOnTheScreen();
  });

  it('narrows options by label as the filter query changes', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <FilterableMultiSelectDropdown options={OPTIONS} value={[]} onChange={() => {}} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));
    await fireEvent.changeText(screen.getByPlaceholderText('Filter options…'), 'type');

    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByText('TypeScript')).toBeOnTheScreen();
  });

  it('narrows options by description too', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <FilterableMultiSelectDropdown options={OPTIONS} value={[]} onChange={() => {}} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));
    await fireEvent.changeText(screen.getByPlaceholderText('Filter options…'), 'general-purpose');

    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByText('Python')).toBeOnTheScreen();
  });

  it('shows "No results" when the filter matches nothing', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <FilterableMultiSelectDropdown options={OPTIONS} value={[]} onChange={() => {}} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));
    await fireEvent.changeText(screen.getByPlaceholderText('Filter options…'), 'rust');

    expect(screen.getByText('No results')).toBeOnTheScreen();
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('keeps a value selected before filtering even after the query hides its option', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <FilterableMultiSelectDropdown options={OPTIONS} value={['js']} onChange={onChange} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));
    await fireEvent.changeText(screen.getByPlaceholderText('Filter options…'), 'type');

    expect(screen.getByText('JavaScript')).toBeOnTheScreen();
  });

  it('toggles an option on and keeps the list open', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <FilterableMultiSelectDropdown options={OPTIONS} value={[]} onChange={onChange} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));
    await fireEvent.press(screen.getByText('TypeScript'));

    expect(onChange).toHaveBeenCalledWith(['ts']);
    expect(screen.getAllByRole('option')).toHaveLength(4);
  });

  it('does not invoke onChange for a disabled option', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <FilterableMultiSelectDropdown options={OPTIONS} value={[]} onChange={onChange} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));
    await fireEvent.press(screen.getByText('COBOL'));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('resets the filter query each time the list is reopened', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <FilterableMultiSelectDropdown options={OPTIONS} value={[]} onChange={() => {}} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));
    await fireEvent.changeText(screen.getByPlaceholderText('Filter options…'), 'type');
    await fireEvent.press(screen.getByRole('combobox'));
    await fireEvent.press(screen.getByRole('combobox'));

    expect(screen.getAllByRole('option')).toHaveLength(4);
  });

  it('closes on backdrop press', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <FilterableMultiSelectDropdown
          options={OPTIONS}
          value={[]}
          onChange={() => {}}
          testID="fmsd"
        />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));
    expect(screen.getAllByRole('option')).toHaveLength(4);

    await fireEvent.press(screen.getByTestId('fmsd-backdrop'));

    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('does not open when disabled', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <FilterableMultiSelectDropdown options={OPTIONS} value={[]} onChange={() => {}} disabled />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('combobox'));

    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });
});
