import { render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';

import { LinkedGroup } from './LinkedGroup';

describe('LinkedGroup', () => {
  it('renders children', async () => {
    await render(
      <LinkedGroup>
        <Text>A</Text>
        <Text>B</Text>
      </LinkedGroup>,
    );

    expect(screen.getByText('A')).toBeOnTheScreen();
    expect(screen.getByText('B')).toBeOnTheScreen();
  });

  it('forwards testID to the root container', async () => {
    await render(
      <LinkedGroup testID="linked">
        <View />
      </LinkedGroup>,
    );

    expect(screen.getByTestId('linked')).toBeOnTheScreen();
  });

  it('forwards a ref to the root container', async () => {
    const ref = { current: null };
    await render(
      <LinkedGroup ref={ref}>
        <View />
      </LinkedGroup>,
    );

    expect(ref.current).not.toBeNull();
  });

  it('defaults to a horizontal row', async () => {
    await render(
      <LinkedGroup testID="linked">
        <View />
      </LinkedGroup>,
    );

    expect(screen.getByTestId('linked')).toHaveStyle({ flexDirection: 'row' });
  });

  it('stacks vertically when vertical is set', async () => {
    await render(
      <LinkedGroup vertical testID="linked">
        <View />
      </LinkedGroup>,
    );

    expect(screen.getByTestId('linked')).toHaveStyle({ flexDirection: 'column' });
  });

  it('gives the first child its outer-left corners and no negative margin', async () => {
    await render(
      <LinkedGroup>
        <View testID="first" />
        <View testID="second" />
        <View testID="third" />
      </LinkedGroup>,
    );

    expect(screen.getByTestId('first')).toHaveStyle({
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      marginLeft: 0,
    });
  });

  it('gives the last child its outer-right corners and a collapsing negative margin', async () => {
    await render(
      <LinkedGroup>
        <View testID="first" />
        <View testID="second" />
        <View testID="third" />
      </LinkedGroup>,
    );

    expect(screen.getByTestId('third')).toHaveStyle({
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      marginLeft: -1,
    });
  });

  it('gives a middle child square corners on both sides', async () => {
    await render(
      <LinkedGroup>
        <View testID="first" />
        <View testID="second" />
        <View testID="third" />
      </LinkedGroup>,
    );

    expect(screen.getByTestId('second')).toHaveStyle({
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      marginLeft: -1,
    });
  });

  it('uses top/bottom corners and marginTop when vertical', async () => {
    await render(
      <LinkedGroup vertical>
        <View testID="first" />
        <View testID="second" />
      </LinkedGroup>,
    );

    expect(screen.getByTestId('first')).toHaveStyle({
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      marginTop: 0,
    });
    expect(screen.getByTestId('second')).toHaveStyle({
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      marginTop: -1,
    });
  });

  it('preserves a style already present on a child alongside the injected corners', async () => {
    await render(
      <LinkedGroup>
        <View testID="first" style={{ opacity: 0.5 }} />
        <View testID="second" />
      </LinkedGroup>,
    );

    expect(screen.getByTestId('first')).toHaveStyle({ opacity: 0.5, borderTopLeftRadius: 8 });
  });

  it('gives a single child all four outer corners', async () => {
    await render(
      <LinkedGroup>
        <View testID="only" />
      </LinkedGroup>,
    );

    expect(screen.getByTestId('only')).toHaveStyle({
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
    });
  });
});
