import { GnomeProvider } from '@gnome-ui/react-native';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { CloudChart } from './CloudChart';

const DATA = [
  { text: 'React', value: 90 },
  { text: 'TypeScript', value: 75 },
  { text: 'GNOME', value: 40 },
  { text: 'Skia', value: 20 },
];

const withProvider = (node: ReactElement) => (
  <GnomeProvider colorScheme="light">{node}</GnomeProvider>
);

describe('CloudChart', () => {
  describe('rendering', () => {
    it('renders without crashing', async () => {
      await render(withProvider(<CloudChart data={DATA} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders every word', async () => {
      await render(withProvider(<CloudChart data={DATA} />));

      expect(screen.getByText('React')).toBeOnTheScreen();
      expect(screen.getByText('TypeScript')).toBeOnTheScreen();
      expect(screen.getByText('GNOME')).toBeOnTheScreen();
      expect(screen.getByText('Skia')).toBeOnTheScreen();
    });

    it('renders without crashing with a single item', async () => {
      await render(withProvider(<CloudChart data={[{ text: 'Solo', value: 1 }]} />));

      expect(screen.getByText('Solo')).toBeOnTheScreen();
    });

    it('scales the highest-value word to maxFontSize and the lowest to minFontSize', async () => {
      await render(withProvider(<CloudChart data={DATA} minFontSize={10} maxFontSize={50} />));

      expect(screen.getByText('React')).toHaveStyle({ fontSize: 50 });
      expect(screen.getByText('Skia')).toHaveStyle({ fontSize: 10 });
    });

    it('uses the same font size for every word when all values are equal', async () => {
      const flatData = [
        { text: 'A', value: 5 },
        { text: 'B', value: 5 },
      ];

      await render(<CloudChart data={flatData} minFontSize={10} maxFontSize={50} />);

      expect(screen.getByText('A')).toHaveStyle({ fontSize: 30 });
      expect(screen.getByText('B')).toHaveStyle({ fontSize: 30 });
    });
  });

  describe('accessibility', () => {
    it('has role="image" on the wrapper', async () => {
      await render(withProvider(<CloudChart data={DATA} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('generates a default accessibility label with the term count', async () => {
      await render(withProvider(<CloudChart data={DATA} />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('Word cloud with 4 terms');
    });

    it('uses the custom aria-label when provided', async () => {
      await render(withProvider(<CloudChart data={DATA} aria-label="Popular tags" />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('Popular tags');
    });
  });
});
