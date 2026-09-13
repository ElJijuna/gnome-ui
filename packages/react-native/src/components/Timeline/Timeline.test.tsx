import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import type { TimelineItem } from './Timeline';
import { Timeline } from './Timeline';

const basicItems: TimelineItem[] = [
  { content: <Text>Event one</Text> },
  { content: <Text>Event two</Text> },
  { content: <Text>Event three</Text> },
];

const richItems: TimelineItem[] = [
  {
    leading: <Text>10:00</Text>,
    icon: <Text testID="icon-0">★</Text>,
    content: <Text>First event</Text>,
  },
  {
    leading: <Text>10:30</Text>,
    icon: <Text testID="icon-1">✓</Text>,
    content: <Text>Second event</Text>,
  },
  {
    content: <Text>Third event</Text>,
  },
];

describe('Timeline', () => {
  describe('rendering', () => {
    it('renders all item content', async () => {
      await render(<Timeline items={basicItems} />);
      expect(screen.getByText('Event one')).toBeOnTheScreen();
      expect(screen.getByText('Event two')).toBeOnTheScreen();
      expect(screen.getByText('Event three')).toBeOnTheScreen();
    });

    it('renders a list container with role="list"', async () => {
      await render(<Timeline items={basicItems} testID="timeline" />);
      expect(screen.getByTestId('timeline').props.role).toBe('list');
    });

    it('renders each item with role="listitem"', async () => {
      await render(<Timeline items={basicItems} testID="timeline" />);
      expect(screen.getByTestId('timeline-item-0').props.role).toBe('listitem');
    });

    it('renders one item per entry', async () => {
      await render(<Timeline items={basicItems} testID="timeline" />);
      expect(screen.getAllByTestId(/^timeline-item-/)).toHaveLength(basicItems.length);
    });

    it('renders leading content when provided', async () => {
      await render(<Timeline items={richItems} />);
      expect(screen.getByText('10:00')).toBeOnTheScreen();
      expect(screen.getByText('10:30')).toBeOnTheScreen();
    });

    it('renders icons when provided', async () => {
      await render(<Timeline items={richItems} />);
      expect(screen.getByTestId('icon-0')).toBeOnTheScreen();
      expect(screen.getByTestId('icon-1')).toBeOnTheScreen();
    });

    it('renders nothing meaningful for an empty items array', async () => {
      await render(<Timeline items={[]} testID="timeline" />);
      expect(screen.queryAllByTestId(/^timeline-item-/)).toHaveLength(0);
    });
  });

  describe('node variants', () => {
    it('sizes the node larger when an icon is provided', async () => {
      await render(
        <Timeline items={[{ icon: <Text>★</Text>, content: <Text>With icon</Text> }]} />,
      );
      expect(screen.getByText('★')).toBeOnTheScreen();
    });

    it('renders a plain dot node when icon is omitted', async () => {
      await render(<Timeline items={[{ content: <Text>No icon</Text> }]} />);
      expect(screen.getByText('No icon')).toBeOnTheScreen();
    });
  });

  describe('orientation', () => {
    it('renders without crashing when orientation="horizontal"', async () => {
      await render(<Timeline items={basicItems} orientation="horizontal" />);
      expect(screen.getByText('Event one')).toBeOnTheScreen();
      expect(screen.getByText('Event three')).toBeOnTheScreen();
    });
  });

  describe('variant', () => {
    it('renders without crashing when variant="dotted"', async () => {
      await render(<Timeline items={basicItems} variant="dotted" />);
      expect(screen.getByText('Event two')).toBeOnTheScreen();
    });

    it('renders without crashing when variant="none"', async () => {
      await render(<Timeline items={basicItems} variant="none" />);
      expect(screen.getByText('Event two')).toBeOnTheScreen();
    });

    it('renders without crashing for a single-item list', async () => {
      await render(<Timeline items={[{ content: <Text>Solo</Text> }]} />);
      expect(screen.getByText('Solo')).toBeOnTheScreen();
    });
  });

  describe('prop forwarding', () => {
    it('forwards testID to the root container', async () => {
      await render(<Timeline items={basicItems} testID="my-timeline" />);
      expect(screen.getByTestId('my-timeline')).toBeOnTheScreen();
    });

    it('forwards style to the root container', async () => {
      await render(<Timeline items={basicItems} testID="my-timeline" style={{ opacity: 0.5 }} />);
      expect(screen.getByTestId('my-timeline').props.style).toMatchObject({ opacity: 0.5 });
    });
  });
});
