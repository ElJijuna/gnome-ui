import { Search, Syncing } from '@gnome-ui/icons';
import { render, screen } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { Icon } from './Icon';

describe('Icon', () => {
  it('renders a paths-based IconDefinition with an accessible label', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Icon icon={Search} label="Search" />
      </GnomeProvider>,
    );

    expect(screen.getByLabelText('Search')).toBeOnTheScreen();
  });

  it('hides decorative icons without a label from the accessibility tree', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Icon icon={Search} />
      </GnomeProvider>,
    );

    expect(screen.queryByRole('image')).not.toBeOnTheScreen();
  });

  it('renders a RawPathIconDefinition (e.g. a simple-icons shape)', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Icon icon={{ path: 'M0 0h10v10H0z' }} label="Custom" />
      </GnomeProvider>,
    );

    expect(screen.getByLabelText('Custom')).toBeOnTheScreen();
  });

  it('renders an svg-field IconDefinition (an animated icon) as an inert static frame', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Icon icon={Syncing} label="Syncing" />
      </GnomeProvider>,
    );

    expect(screen.getByLabelText('Syncing')).toBeOnTheScreen();
  });

  it('resolves the default color to the theme foreground token', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Icon icon={Search} label="Search" />
      </GnomeProvider>,
    );

    expect(screen.getByLabelText('Search').props.fill).toBe('rgba(0, 0, 0, 0.8)');
  });

  it('resolves a named palette color', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Icon icon={Search} label="Search" color="blue" />
      </GnomeProvider>,
    );

    expect(screen.getByLabelText('Search').props.fill).toBe('#3584e4');
  });

  it('defaults to the md size (16px)', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Icon icon={Search} label="Search" />
      </GnomeProvider>,
    );

    expect(screen.getByLabelText('Search').props.width).toBe(16);
  });

  it('maps size="lg" to 20px', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Icon icon={Search} label="Search" size="lg" />
      </GnomeProvider>,
    );

    expect(screen.getByLabelText('Search').props.width).toBe(20);
  });
});
