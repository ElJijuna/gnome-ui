import { fireEvent, render, screen } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { Chip } from './Chip';

describe('Chip', () => {
  describe('static mode', () => {
    it('renders the label', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Chip label="React" />
        </GnomeProvider>,
      );

      expect(screen.getByText('React')).toBeOnTheScreen();
    });

    it('does not render a remove button when onRemove is omitted', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Chip label="React" />
        </GnomeProvider>,
      );

      expect(screen.queryByRole('button')).not.toBeOnTheScreen();
    });

    it('does not render a checkbox when not selectable', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Chip label="React" />
        </GnomeProvider>,
      );

      expect(screen.queryByRole('checkbox')).not.toBeOnTheScreen();
    });
  });

  describe('removable mode', () => {
    it("renders a remove button with accessibilityLabel 'Remove <label>'", async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Chip label="React" onRemove={jest.fn()} />
        </GnomeProvider>,
      );

      expect(screen.getByRole('button', { name: 'Remove React' })).toBeOnTheScreen();
    });

    it('calls onRemove when the remove button is pressed', async () => {
      const onRemove = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <Chip label="React" onRemove={onRemove} />
        </GnomeProvider>,
      );

      await fireEvent.press(screen.getByRole('button', { name: 'Remove React' }));
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('remove button is disabled when disabled=true', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Chip label="React" onRemove={jest.fn()} disabled />
        </GnomeProvider>,
      );

      expect(screen.getByRole('button', { name: 'Remove React' })).toBeDisabled();
    });

    it('selectable is ignored when onRemove is also provided', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Chip label="React" selectable onToggle={jest.fn()} onRemove={jest.fn()} />
        </GnomeProvider>,
      );

      expect(screen.queryByRole('checkbox')).not.toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Remove React' })).toBeOnTheScreen();
    });
  });

  describe('selectable mode', () => {
    it('renders as a checkbox', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Chip label="React" selectable selected={false} onToggle={jest.fn()} />
        </GnomeProvider>,
      );

      expect(screen.getByRole('checkbox', { name: 'React' })).toBeOnTheScreen();
    });

    it('reflects checked=false when not selected', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Chip label="React" selectable selected={false} onToggle={jest.fn()} />
        </GnomeProvider>,
      );

      expect(screen.getByRole('checkbox', { name: 'React' }).props.accessibilityState).toEqual(
        expect.objectContaining({ checked: false }),
      );
    });

    it('reflects checked=true when selected', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Chip label="React" selectable selected onToggle={jest.fn()} />
        </GnomeProvider>,
      );

      expect(screen.getByRole('checkbox', { name: 'React' }).props.accessibilityState).toEqual(
        expect.objectContaining({ checked: true }),
      );
    });

    it('calls onToggle when pressed', async () => {
      const onToggle = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <Chip label="React" selectable selected={false} onToggle={onToggle} />
        </GnomeProvider>,
      );

      await fireEvent.press(screen.getByRole('checkbox', { name: 'React' }));
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled=true', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Chip label="React" selectable selected={false} onToggle={jest.fn()} disabled />
        </GnomeProvider>,
      );

      expect(screen.getByRole('checkbox', { name: 'React' })).toBeDisabled();
    });
  });

  describe('icon', () => {
    it('renders the leading icon when provided', async () => {
      const icon = { viewBox: '0 0 16 16', paths: [{ d: 'M0 0h16v16H0z' }] };

      await render(
        <GnomeProvider colorScheme="light">
          <Chip label="React" icon={icon} />
        </GnomeProvider>,
      );

      expect(screen.getByText('React')).toBeOnTheScreen();
    });
  });
});
