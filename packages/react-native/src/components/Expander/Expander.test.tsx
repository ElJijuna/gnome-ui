import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { Expander } from './Expander';

describe('Expander', () => {
  describe('rendering', () => {
    it('renders the label', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Expander label="Show advanced options" />
        </GnomeProvider>,
      );

      expect(screen.getByText('Show advanced options')).toBeOnTheScreen();
    });

    it('accepts a non-string label', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Expander label={<View testID="custom-label" />}>
            <Text>Content</Text>
          </Expander>
        </GnomeProvider>,
      );

      expect(screen.getByTestId('custom-label')).toBeOnTheScreen();
    });

    it('renders a toggle button controlling a labelled region', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Expander label="Advanced" />
        </GnomeProvider>,
      );

      expect(screen.getByRole('button', { name: 'Advanced' })).toBeOnTheScreen();
      expect(screen.getByRole('region', { includeHiddenElements: true })).toBeOnTheScreen();
    });

    it('renders children', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Expander label="Advanced" defaultExpanded>
            <Text>Nested content</Text>
          </Expander>
        </GnomeProvider>,
      );

      expect(screen.getByText('Nested content')).toBeOnTheScreen();
    });

    it('keeps children mounted while collapsed', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Expander label="Advanced">
            <Text>Nested content</Text>
          </Expander>
        </GnomeProvider>,
      );

      expect(screen.queryByText('Nested content')).not.toBeOnTheScreen();
      expect(screen.getByText('Nested content', { includeHiddenElements: true })).toBeTruthy();
    });
  });

  describe('expanded state', () => {
    it('is collapsed by default', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Expander label="Advanced" />
        </GnomeProvider>,
      );

      expect(screen.getByRole('button', { name: 'Advanced' }).props.accessibilityState).toEqual(
        expect.objectContaining({ expanded: false }),
      );
    });

    it('is expanded when defaultExpanded is true', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Expander label="Advanced" defaultExpanded />
        </GnomeProvider>,
      );

      expect(screen.getByRole('button', { name: 'Advanced' }).props.accessibilityState).toEqual(
        expect.objectContaining({ expanded: true }),
      );
    });

    it('reflects a controlled expanded prop', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Expander label="Advanced" expanded onExpandedChange={jest.fn()} />
        </GnomeProvider>,
      );

      expect(screen.getByRole('button', { name: 'Advanced' }).props.accessibilityState).toEqual(
        expect.objectContaining({ expanded: true }),
      );
    });

    it('does not change on press when controlled', async () => {
      const onExpandedChange = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <Expander label="Advanced" expanded={false} onExpandedChange={onExpandedChange} />
        </GnomeProvider>,
      );

      await fireEvent.press(screen.getByRole('button', { name: 'Advanced' }));

      expect(screen.getByRole('button', { name: 'Advanced' }).props.accessibilityState).toEqual(
        expect.objectContaining({ expanded: false }),
      );
      expect(onExpandedChange).toHaveBeenCalledWith(true);
    });
  });

  describe('interactions', () => {
    it('toggles expanded state on header press when uncontrolled', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Expander label="Advanced" />
        </GnomeProvider>,
      );

      const button = screen.getByRole('button', { name: 'Advanced' });

      await fireEvent.press(button);
      expect(button.props.accessibilityState).toEqual(expect.objectContaining({ expanded: true }));

      await fireEvent.press(button);
      expect(button.props.accessibilityState).toEqual(expect.objectContaining({ expanded: false }));
    });

    it('calls onExpandedChange with the next value', async () => {
      const onExpandedChange = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <Expander label="Advanced" onExpandedChange={onExpandedChange} />
        </GnomeProvider>,
      );

      await fireEvent.press(screen.getByRole('button', { name: 'Advanced' }));

      expect(onExpandedChange).toHaveBeenCalledTimes(1);
      expect(onExpandedChange).toHaveBeenCalledWith(true);
    });
  });

  describe('disabled', () => {
    it('disables the toggle button', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Expander label="Advanced" disabled />
        </GnomeProvider>,
      );

      expect(screen.getByRole('button', { name: 'Advanced' })).toBeDisabled();
    });

    it('does not toggle on press when disabled', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Expander label="Advanced" disabled />
        </GnomeProvider>,
      );

      const button = screen.getByRole('button', { name: 'Advanced' });

      await fireEvent.press(button);

      expect(button.props.accessibilityState).toEqual(expect.objectContaining({ expanded: false }));
    });
  });
});
