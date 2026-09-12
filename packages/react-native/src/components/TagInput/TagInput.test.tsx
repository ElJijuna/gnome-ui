import { fireEvent, render, screen } from '@testing-library/react-native';
import { type ReactElement, useState } from 'react';
import { StyleSheet } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { TagInput, type TagInputProps } from './TagInput';

const wrap = (ui: ReactElement) => render(<GnomeProvider colorScheme="light">{ui}</GnomeProvider>);

const draftInput = (label = 'Tags') => screen.getByLabelText(label);

/** Wires `value`/`onChange` to real state so multi-step interactions can be exercised. */
const Controlled = (props: Omit<TagInputProps, 'value' | 'onChange'> & { initial?: string[] }) => {
  const [value, setValue] = useState(props.initial ?? []);

  return <TagInput {...props} value={value} onChange={setValue} />;
};

describe('TagInput', () => {
  it('renders existing tags as chips', async () => {
    await wrap(<TagInput label="Tags" value={['react', 'gnome']} onChange={jest.fn()} />);

    expect(screen.getByText('react')).toBeOnTheScreen();
    expect(screen.getByText('gnome')).toBeOnTheScreen();
  });

  it('renders the label', async () => {
    await wrap(<TagInput label="Tags" value={[]} onChange={jest.fn()} />);

    expect(screen.getByText('Tags')).toBeOnTheScreen();
  });

  it('renders helper text and error state', async () => {
    const { rerender } = await wrap(
      <TagInput label="Tags" value={[]} onChange={jest.fn()} helperText="Press Enter to add" />,
    );

    expect(screen.getByText('Press Enter to add')).toBeOnTheScreen();

    await rerender(
      <GnomeProvider colorScheme="light">
        <TagInput
          label="Tags"
          value={[]}
          onChange={jest.fn()}
          helperText="Press Enter to add"
          error="At least one tag is required"
        />
      </GnomeProvider>,
    );

    expect(screen.getByText('At least one tag is required')).toBeOnTheScreen();
    expect(screen.queryByText('Press Enter to add')).toBeNull();
  });

  describe('adding tags', () => {
    it('commits the draft on submit (Return)', async () => {
      await wrap(<Controlled label="Tags" />);

      await fireEvent.changeText(draftInput(), 'react');
      await fireEvent(draftInput(), 'submitEditing');

      expect(screen.getByText('react')).toBeOnTheScreen();
    });

    it('clears the draft after committing', async () => {
      await wrap(<Controlled label="Tags" />);

      await fireEvent.changeText(draftInput(), 'react');
      await fireEvent(draftInput(), 'submitEditing');

      expect(draftInput().props.value).toBe('');
    });

    it('ignores an empty or whitespace-only draft', async () => {
      const onChange = jest.fn();

      await wrap(<TagInput label="Tags" value={[]} onChange={onChange} />);

      await fireEvent.changeText(draftInput(), '   ');
      await fireEvent(draftInput(), 'submitEditing');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('commits a tag when a comma is typed', async () => {
      await wrap(<Controlled label="Tags" />);

      await fireEvent.changeText(draftInput(), 'react,');

      expect(screen.getByText('react')).toBeOnTheScreen();
      expect(draftInput().props.value).toBe('');
    });

    it('splits a pasted comma-separated list into several tags', async () => {
      await wrap(<Controlled label="Tags" />);

      await fireEvent.changeText(draftInput(), 'react,gnome,vue');

      expect(screen.getByText('react')).toBeOnTheScreen();
      expect(screen.getByText('gnome')).toBeOnTheScreen();
      expect(screen.getByText('vue')).toBeOnTheScreen();
    });

    it('splits a pasted newline-separated list into several tags', async () => {
      await wrap(<Controlled label="Tags" />);

      await fireEvent.changeText(draftInput(), 'react\ngnome');

      expect(screen.getByText('react')).toBeOnTheScreen();
      expect(screen.getByText('gnome')).toBeOnTheScreen();
    });

    it('rejects a duplicate tag (case-insensitive) by default', async () => {
      await wrap(<Controlled label="Tags" initial={['React']} />);

      await fireEvent.changeText(draftInput(), 'react');
      await fireEvent(draftInput(), 'submitEditing');

      expect(screen.getAllByText(/react/i)).toHaveLength(1);
    });

    it('allows duplicates when preventDuplicates is false', async () => {
      await wrap(<Controlled label="Tags" initial={['react']} preventDuplicates={false} />);

      await fireEvent.changeText(draftInput(), 'react');
      await fireEvent(draftInput(), 'submitEditing');

      expect(screen.getAllByText('react')).toHaveLength(2);
    });

    it('stops accepting new tags once maxTags is reached', async () => {
      await wrap(<Controlled label="Tags" initial={['a', 'b']} maxTags={2} />);

      expect(screen.queryByLabelText('Tags')).toBeNull();
    });
  });

  describe('removing tags', () => {
    it('removes a tag when its chip remove button is pressed', async () => {
      const onChange = jest.fn();

      await wrap(<TagInput label="Tags" value={['react', 'gnome']} onChange={onChange} />);

      await fireEvent.press(screen.getByLabelText('Remove react'));

      expect(onChange).toHaveBeenCalledWith(['gnome']);
    });

    it('removes the last tag on Backspace with an empty draft', async () => {
      await wrap(<Controlled label="Tags" initial={['react', 'gnome']} />);

      await fireEvent(draftInput(), 'keyPress', { nativeEvent: { key: 'Backspace' } });

      expect(screen.queryByText('gnome')).toBeNull();
      expect(screen.getByText('react')).toBeOnTheScreen();
    });

    it('does not remove a tag on Backspace while the draft has text', async () => {
      const onChange = jest.fn();

      await wrap(<TagInput label="Tags" value={['react']} onChange={onChange} />);

      await fireEvent.changeText(draftInput(), 'g');
      await fireEvent(draftInput(), 'keyPress', { nativeEvent: { key: 'Backspace' } });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('disabled', () => {
    it('dims the control', async () => {
      await wrap(<TagInput testID="tags" label="Tags" value={[]} onChange={jest.fn()} disabled />);

      expect(StyleSheet.flatten(screen.getByTestId('tags').props.style).opacity).toBe(0.5);
    });

    it('marks the draft input as not editable', async () => {
      await wrap(<TagInput label="Tags" value={[]} onChange={jest.fn()} disabled />);

      expect(draftInput().props.editable).toBe(false);
    });
  });
});
