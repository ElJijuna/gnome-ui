import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { NavigationPage, NavigationView, useNavigation } from './NavigationView';

function HomeControls({ target }: { target: string }) {
  const { navigate } = useNavigation();

  return (
    <button type="button" onClick={() => navigate(target)}>
      Open {target}
    </button>
  );
}

function BackButton() {
  const { pop, canGoBack } = useNavigation();

  return (
    <button type="button" onClick={pop} disabled={!canGoBack}>
      Back
    </button>
  );
}

describe('NavigationView', () => {
  describe('rendering', () => {
    it('renders only the initial page', () => {
      render(
        <NavigationView initialPage="home">
          <NavigationPage tag="home" title="Home">
            Home content
          </NavigationPage>
          <NavigationPage tag="details" title="Details">
            Details content
          </NavigationPage>
        </NavigationView>,
      );

      expect(screen.getByText('Home content')).toBeInTheDocument();
      expect(screen.queryByText('Details content')).not.toBeInTheDocument();
    });

    it('renders the page title', () => {
      render(
        <NavigationView initialPage="home">
          <NavigationPage tag="home" title="Home">
            Content
          </NavigationPage>
        </NavigationView>,
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  describe('navigation stack', () => {
    it('navigate() pushes and shows the target page', async () => {
      render(
        <NavigationView initialPage="home">
          <NavigationPage tag="home" title="Home">
            <HomeControls target="details" />
          </NavigationPage>
          <NavigationPage tag="details" title="Details">
            Details content
          </NavigationPage>
        </NavigationView>,
      );

      await userEvent.click(screen.getByRole('button', { name: 'Open details' }));

      expect(screen.getByText('Details content')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Open details' })).not.toBeInTheDocument();
    });

    it('pop() returns to the previous page', async () => {
      render(
        <NavigationView initialPage="home">
          <NavigationPage tag="home" title="Home">
            <HomeControls target="details" />
          </NavigationPage>
          <NavigationPage tag="details" title="Details">
            <BackButton />
          </NavigationPage>
        </NavigationView>,
      );

      await userEvent.click(screen.getByRole('button', { name: 'Open details' }));
      await userEvent.click(screen.getByRole('button', { name: 'Back' }));

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
    });

    it('canGoBack is false at the root and true after navigating', async () => {
      render(
        <NavigationView initialPage="home">
          <NavigationPage tag="home" title="Home">
            <BackButton />
            <HomeControls target="details" />
          </NavigationPage>
          <NavigationPage tag="details" title="Details">
            <BackButton />
          </NavigationPage>
        </NavigationView>,
      );

      expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();

      await userEvent.click(screen.getByRole('button', { name: 'Open details' }));
      expect(screen.getByRole('button', { name: 'Back' })).not.toBeDisabled();
    });

    it('pop() at the root is a no-op', async () => {
      render(
        <NavigationView initialPage="home">
          <NavigationPage tag="home" title="Home">
            <BackButton />
          </NavigationPage>
        </NavigationView>,
      );

      await userEvent.click(screen.getByRole('button', { name: 'Back' }));
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('supports navigating multiple levels deep', async () => {
      render(
        <NavigationView initialPage="a">
          <NavigationPage tag="a" title="A">
            <HomeControls target="b" />
          </NavigationPage>
          <NavigationPage tag="b" title="B">
            <HomeControls target="c" />
          </NavigationPage>
          <NavigationPage tag="c" title="C">
            C content
          </NavigationPage>
        </NavigationView>,
      );

      await userEvent.click(screen.getByRole('button', { name: 'Open b' }));
      await userEvent.click(screen.getByRole('button', { name: 'Open c' }));

      expect(screen.getByText('C content')).toBeInTheDocument();
    });
  });

  describe('useNavigation outside a provider', () => {
    it('falls back to the default context without throwing', () => {
      expect(() => render(<BackButton />)).not.toThrow();
      expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      const { container } = render(
        <NavigationView initialPage="home" className="custom">
          <NavigationPage tag="home" title="Home" />
        </NavigationView>,
      );

      expect(container.firstElementChild).toHaveClass('custom');
    });
  });
});
