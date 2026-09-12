import { render, screen } from '@testing-library/react-native';
import { Text as RNText } from 'react-native';

import { ButtonContent } from './ButtonContent';

describe('ButtonContent', () => {
  it('renders the label', async () => {
    await render(<ButtonContent label="Save" />);

    expect(screen.getByText('Save')).toBeOnTheScreen();
  });

  it('renders the icon when provided', async () => {
    await render(<ButtonContent label="Save" icon={<RNText testID="icon">★</RNText>} />);

    expect(screen.getByTestId('icon', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('renders no icon when omitted', async () => {
    await render(<ButtonContent label="Save" />);

    expect(screen.queryByTestId('icon')).not.toBeOnTheScreen();
  });

  it("hides the icon slot from the accessibility tree, like the web version's aria-hidden", async () => {
    await render(
      <ButtonContent label="Save" icon={<RNText testID="icon">★</RNText>} testID="content" />,
    );

    const iconSlot = screen.getByTestId('icon', { includeHiddenElements: true }).parent;

    expect(iconSlot?.props.accessibilityElementsHidden).toBe(true);
    expect(iconSlot?.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('resolves a different label color per the color prop', async () => {
    await render(<ButtonContent label="Save" color="default" />);
    const defaultColor = screen.getByText('Save').props.style;

    await render(<ButtonContent label="Save" color="accent" />);
    const accentColor = screen.getByText('Save').props.style;

    expect(accentColor).not.toEqual(defaultColor);
  });

  it('forwards testID to the root view', async () => {
    await render(<ButtonContent label="Save" testID="content" />);

    expect(screen.getByTestId('content')).toBeOnTheScreen();
  });
});
