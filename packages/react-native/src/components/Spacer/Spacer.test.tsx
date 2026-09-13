import { render, screen } from '@testing-library/react-native';

import { Spacer } from './Spacer';

describe('Spacer', () => {
  it('renders', async () => {
    await render(<Spacer testID="spacer" />);
    expect(screen.getByTestId('spacer')).toBeOnTheScreen();
  });

  it('is excluded from the accessibility tree', async () => {
    await render(<Spacer testID="spacer" />);
    expect(screen.getByTestId('spacer').props.accessible).toBe(false);
  });

  it('applies a flex: 1 style', async () => {
    await render(<Spacer testID="spacer" />);
    expect(screen.getByTestId('spacer')).toHaveStyle({ flex: 1 });
  });

  it('merges a forwarded style with its own', async () => {
    await render(<Spacer testID="spacer" style={{ backgroundColor: 'red' }} />);
    expect(screen.getByTestId('spacer')).toHaveStyle({ flex: 1, backgroundColor: 'red' });
  });

  it('forwards a ref to the underlying view', async () => {
    const ref = { current: null };
    await render(<Spacer ref={ref} />);
    expect(ref.current).not.toBeNull();
  });
});
