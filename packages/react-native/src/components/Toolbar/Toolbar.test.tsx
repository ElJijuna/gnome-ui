import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Toolbar } from './Toolbar';

describe('Toolbar', () => {
  it('renders children', async () => {
    await render(
      <Toolbar>
        <Text>Save</Text>
      </Toolbar>,
    );

    expect(screen.getByText('Save')).toBeOnTheScreen();
  });

  it('forwards testID', async () => {
    await render(
      <Toolbar testID="toolbar">
        <Text>Save</Text>
      </Toolbar>,
    );

    expect(screen.getByTestId('toolbar')).toBeOnTheScreen();
  });

  it('forwards accessibilityLabel', async () => {
    await render(
      <Toolbar accessibilityLabel="actions" testID="toolbar">
        <Text>Save</Text>
      </Toolbar>,
    );

    expect(screen.getByTestId('toolbar').props.accessibilityLabel).toBe('actions');
  });

  it('merges a forwarded style with its own', async () => {
    await render(
      <Toolbar testID="toolbar" style={{ backgroundColor: 'red' }}>
        <Text>Save</Text>
      </Toolbar>,
    );

    expect(screen.getByTestId('toolbar')).toHaveStyle({
      backgroundColor: 'red',
      flexDirection: 'row',
    });
  });

  it('forwards a ref to the underlying view', async () => {
    const ref = { current: null };
    await render(
      <Toolbar ref={ref}>
        <Text>Save</Text>
      </Toolbar>,
    );

    expect(ref.current).not.toBeNull();
  });
});
