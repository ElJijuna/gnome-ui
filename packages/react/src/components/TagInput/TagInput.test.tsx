import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TagInput } from './TagInput';

describe('TagInput', () => {
  describe('rendering', () => {
    it('renders a tag chip for each value', () => {
      render(<TagInput value={['react', 'gnome']} onChange={vi.fn()} label="Tags" />);

      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('gnome')).toBeInTheDocument();
    });

    it('renders a label when provided', () => {
      render(<TagInput value={[]} onChange={vi.fn()} label="Tags" />);
      expect(screen.getByLabelText('Tags')).toBeInTheDocument();
    });

    it('renders helper text below the input', () => {
      render(<TagInput value={[]} onChange={vi.fn()} label="Tags" helperText="Press Enter to add" />);
      expect(screen.getByText('Press Enter to add')).toBeInTheDocument();
    });

    it('renders error message instead of helper text', () => {
      render(
        <TagInput value={[]} onChange={vi.fn()} label="Tags" helperText="Helper" error="Required" />,
      );
      expect(screen.getByText('Required')).toBeInTheDocument();
      expect(screen.queryByText('Helper')).not.toBeInTheDocument();
    });

    it('renders no chips when value is empty', () => {
      const { container } = render(<TagInput value={[]} onChange={vi.fn()} label="Tags" />);
      expect(container.querySelectorAll('[class*="chip"]')).toHaveLength(0);
    });
  });

  describe('adding tags', () => {
    it('commits the draft as a new tag on Enter', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<TagInput value={['react']} onChange={onChange} label="Tags" />);
      await user.type(screen.getByLabelText('Tags'), 'gnome{Enter}');

      expect(onChange).toHaveBeenCalledWith(['react', 'gnome']);
    });

    it('commits the draft as a new tag on comma', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<TagInput value={[]} onChange={onChange} label="Tags" />);
      await user.type(screen.getByLabelText('Tags'), 'gnome,');

      expect(onChange).toHaveBeenCalledWith(['gnome']);
    });

    it('clears the draft after committing', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<TagInput value={[]} onChange={onChange} label="Tags" />);
      const input = screen.getByLabelText('Tags') as HTMLInputElement;

      await user.type(input, 'gnome{Enter}');
      expect(input).toHaveValue('');
    });

    it('trims whitespace from the committed tag', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<TagInput value={[]} onChange={onChange} label="Tags" />);
      await user.type(screen.getByLabelText('Tags'), '  gnome  {Enter}');

      expect(onChange).toHaveBeenCalledWith(['gnome']);
    });

    it('ignores an empty draft on Enter', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<TagInput value={[]} onChange={onChange} label="Tags" />);
      await user.type(screen.getByLabelText('Tags'), '{Enter}');

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('duplicate prevention', () => {
    it('rejects a duplicate tag (case-insensitive) by default', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<TagInput value={['React']} onChange={onChange} label="Tags" />);
      await user.type(screen.getByLabelText('Tags'), 'react{Enter}');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('allows duplicates when preventDuplicates is false', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(
        <TagInput value={['react']} onChange={onChange} label="Tags" preventDuplicates={false} />,
      );
      await user.type(screen.getByLabelText('Tags'), 'react{Enter}');

      expect(onChange).toHaveBeenCalledWith(['react', 'react']);
    });
  });

  describe('maxTags', () => {
    it('hides the text input once maxTags is reached', () => {
      render(<TagInput value={['a', 'b']} onChange={vi.fn()} label="Tags" maxTags={2} />);
      expect(screen.queryByLabelText('Tags')).not.toBeInTheDocument();
    });

    it('does not add a tag beyond maxTags via paste', () => {
      const onChange = vi.fn();

      render(<TagInput value={['a']} onChange={onChange} label="Tags" maxTags={2} />);
      const input = screen.getByLabelText('Tags');

      fireEvent.paste(input, { clipboardData: { getData: () => 'b,c,d' } });

      expect(onChange).toHaveBeenCalledWith(['a', 'b']);
    });
  });

  describe('removing tags', () => {
    it('removes a tag when its chip remove button is clicked', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<TagInput value={['react', 'gnome']} onChange={onChange} label="Tags" />);
      await user.click(screen.getByRole('button', { name: 'Remove react' }));

      expect(onChange).toHaveBeenCalledWith(['gnome']);
    });

    it('removes the last tag on Backspace when the draft is empty', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<TagInput value={['react', 'gnome']} onChange={onChange} label="Tags" />);
      screen.getByLabelText('Tags').focus();
      await user.keyboard('{Backspace}');

      expect(onChange).toHaveBeenCalledWith(['react']);
    });

    it('does not remove a tag on Backspace when the draft has text', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<TagInput value={['react']} onChange={onChange} label="Tags" />);
      await user.type(screen.getByLabelText('Tags'), 'gn');
      await user.keyboard('{Backspace}');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('removes the correct occurrence among duplicate tags', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(
        <TagInput
          value={['react', 'react']}
          onChange={onChange}
          label="Tags"
          preventDuplicates={false}
        />,
      );
      const removeButtons = screen.getAllByRole('button', { name: 'Remove react' });
      await user.click(removeButtons[0]);

      expect(onChange).toHaveBeenCalledWith(['react']);
    });
  });

  describe('paste', () => {
    it('adds multiple tags from a comma-separated paste', () => {
      const onChange = vi.fn();

      render(<TagInput value={[]} onChange={onChange} label="Tags" />);
      const input = screen.getByLabelText('Tags');

      fireEvent.paste(input, { clipboardData: { getData: () => 'react, gnome, vue' } });

      expect(onChange).toHaveBeenCalledWith(['react', 'gnome', 'vue']);
    });

    it('skips duplicate tags found in the pasted text', () => {
      const onChange = vi.fn();

      render(<TagInput value={['react']} onChange={onChange} label="Tags" />);
      const input = screen.getByLabelText('Tags');

      fireEvent.paste(input, { clipboardData: { getData: () => 'react,gnome' } });

      expect(onChange).toHaveBeenCalledWith(['react', 'gnome']);
    });

    it('lets a single-value paste with no delimiter fall through to normal typing', () => {
      const onChange = vi.fn();

      render(<TagInput value={[]} onChange={onChange} label="Tags" />);
      const input = screen.getByLabelText('Tags');

      fireEvent.paste(input, { clipboardData: { getData: () => 'gnome' } });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('disabled', () => {
    it('disables the text input', () => {
      render(<TagInput value={[]} onChange={vi.fn()} label="Tags" disabled />);
      expect(screen.getByLabelText('Tags')).toBeDisabled();
    });

    it('omits the remove button on chips when disabled', () => {
      render(<TagInput value={['react']} onChange={vi.fn()} label="Tags" disabled />);
      expect(screen.queryByRole('button', { name: 'Remove react' })).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('associates label with the input via htmlFor/id', () => {
      render(<TagInput value={[]} onChange={vi.fn()} label="Tags" />);
      expect(screen.getByLabelText('Tags')).toBeInTheDocument();
    });

    it('sets aria-describedby when helperText is present', () => {
      render(<TagInput value={[]} onChange={vi.fn()} label="Tags" helperText="Hint" />);
      expect(screen.getByLabelText('Tags')).toHaveAttribute('aria-describedby');
    });

    it('sets aria-invalid when error is present', () => {
      render(<TagInput value={[]} onChange={vi.fn()} label="Tags" error="Required" />);
      expect(screen.getByLabelText('Tags')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards placeholder to the input', () => {
      render(<TagInput value={[]} onChange={vi.fn()} label="Tags" placeholder="Add a tag…" />);
      expect(screen.getByPlaceholderText('Add a tag…')).toBeInTheDocument();
    });

    it('forwards data attributes to the input', () => {
      render(<TagInput value={[]} onChange={vi.fn()} label="Tags" data-testid="tag-field" />);
      expect(screen.getByTestId('tag-field')).toBeInTheDocument();
    });
  });
});
