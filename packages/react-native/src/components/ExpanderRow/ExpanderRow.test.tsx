import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ExpanderRow } from './ExpanderRow';

describe('ExpanderRow', () => {
  describe('rendering', () => {
    it('renders title and subtitle', async () => {
      await render(<ExpanderRow title="Advanced" subtitle="More options" />);

      expect(screen.getByText('Advanced')).toBeOnTheScreen();
      expect(screen.getByText('More options')).toBeOnTheScreen();
    });

    it('renders leading and trailing content', async () => {
      await render(
        <ExpanderRow
          title="Advanced"
          leading={<Text testID="leading">L</Text>}
          trailing={<Text testID="trailing">T</Text>}
        />,
      );

      expect(screen.getByTestId('leading')).toBeOnTheScreen();
      expect(screen.getByTestId('trailing')).toBeOnTheScreen();
    });

    it('renders a toggle button', async () => {
      await render(<ExpanderRow title="Advanced" />);

      expect(screen.getByRole('button')).toBeOnTheScreen();
    });

    it('renders nested child rows', async () => {
      await render(
        <ExpanderRow title="Advanced">
          <Text>Child one</Text>
          <Text>Child two</Text>
        </ExpanderRow>,
      );

      expect(screen.getByText('Child one', { includeHiddenElements: true })).toBeOnTheScreen();
      expect(screen.getByText('Child two', { includeHiddenElements: true })).toBeOnTheScreen();
    });

    it('filters out falsy children', async () => {
      await render(
        <ExpanderRow title="Advanced">
          {null}
          <Text>Only child</Text>
          {false}
        </ExpanderRow>,
      );

      expect(screen.getAllByText('Only child', { includeHiddenElements: true })).toHaveLength(1);
    });

    it('inserts a separator before each nested child', async () => {
      await render(
        <ExpanderRow title="Advanced">
          <Text>Child one</Text>
          <Text>Child two</Text>
        </ExpanderRow>,
      );

      expect(
        screen.getAllByTestId('expander-row-separator', { includeHiddenElements: true }),
      ).toHaveLength(2);
    });
  });

  describe('expanded state', () => {
    it('is collapsed by default', async () => {
      await render(<ExpanderRow title="Advanced" />);

      expect(screen.getByRole('button').props.accessibilityState.expanded).toBe(false);
    });

    it('is expanded when defaultExpanded is true', async () => {
      await render(<ExpanderRow title="Advanced" defaultExpanded />);

      expect(screen.getByRole('button').props.accessibilityState.expanded).toBe(true);
    });

    it('reflects a controlled expanded prop', async () => {
      await render(<ExpanderRow title="Advanced" expanded onExpandedChange={() => {}} />);

      expect(screen.getByRole('button').props.accessibilityState.expanded).toBe(true);
    });

    it('does not change on press when controlled', async () => {
      const onExpandedChange = jest.fn();

      await render(
        <ExpanderRow title="Advanced" expanded={false} onExpandedChange={onExpandedChange} />,
      );
      await fireEvent.press(screen.getByRole('button'));

      expect(screen.getByRole('button').props.accessibilityState.expanded).toBe(false);
      expect(onExpandedChange).toHaveBeenCalledWith(true);
    });
  });

  describe('interactions', () => {
    it('toggles expanded state on header press when uncontrolled', async () => {
      await render(<ExpanderRow title="Advanced" />);
      const button = screen.getByRole('button');

      await fireEvent.press(button);
      expect(button.props.accessibilityState.expanded).toBe(true);

      await fireEvent.press(button);
      expect(button.props.accessibilityState.expanded).toBe(false);
    });

    it('calls onExpandedChange with the next value', async () => {
      const onExpandedChange = jest.fn();

      await render(<ExpanderRow title="Advanced" onExpandedChange={onExpandedChange} />);
      await fireEvent.press(screen.getByRole('button'));

      expect(onExpandedChange).toHaveBeenCalledTimes(1);
      expect(onExpandedChange).toHaveBeenCalledWith(true);
    });
  });

  it('forwards a ref to the underlying view', async () => {
    const ref = { current: null };
    await render(<ExpanderRow title="Advanced" ref={ref} />);

    expect(ref.current).not.toBeNull();
  });
});
