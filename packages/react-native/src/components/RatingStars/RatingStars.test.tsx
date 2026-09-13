import { fireEvent, render, screen } from '@testing-library/react-native';

import { RatingStars } from './RatingStars';

describe('RatingStars', () => {
  describe('read-only (no onChange)', () => {
    it('renders as a static image with a generated label', async () => {
      await render(<RatingStars value={3} testID="rating" />);
      const rating = screen.getByTestId('rating');

      expect(rating.props.role).toBe('img');
      expect(rating.props.accessibilityLabel).toBe('3 out of 5 stars');
    });

    it('accepts a custom label', async () => {
      await render(
        <RatingStars
          value={4.2}
          accessibilityLabel="Average rating: 4.2 out of 5"
          testID="rating"
        />,
      );

      expect(screen.getByTestId('rating').props.accessibilityLabel).toBe(
        'Average rating: 4.2 out of 5',
      );
    });

    it('renders no radios', async () => {
      await render(<RatingStars value={3} />);

      expect(screen.queryAllByRole('radio')).toHaveLength(0);
    });

    it('clamps the label to [0, max]', async () => {
      await render(<RatingStars value={99} testID="over" />);
      expect(screen.getByTestId('over').props.accessibilityLabel).toBe('5 out of 5 stars');

      await render(<RatingStars value={-3} testID="under" />);
      expect(screen.getByTestId('under').props.accessibilityLabel).toBe('0 out of 5 stars');
    });

    it('respects a custom max', async () => {
      await render(<RatingStars value={7} max={10} testID="rating" />);
      expect(screen.getByTestId('rating').props.accessibilityLabel).toBe('7 out of 10 stars');
    });

    it('renders as read-only when disabled even with onChange provided', async () => {
      const onChange = jest.fn();
      await render(<RatingStars value={2} onChange={onChange} disabled testID="rating" />);

      expect(screen.getByTestId('rating').props.role).toBe('img');
      expect(screen.queryAllByRole('radio')).toHaveLength(0);
    });
  });

  describe('interactive (onChange provided)', () => {
    it('exposes a radiogroup with a default label', async () => {
      await render(<RatingStars value={0} onChange={() => {}} testID="rating" />);
      const rating = screen.getByTestId('rating');

      expect(rating.props.role).toBe('radiogroup');
      expect(rating.props.accessibilityLabel).toBe('Rating');
    });

    it('accepts a custom group label', async () => {
      await render(
        <RatingStars
          value={0}
          onChange={() => {}}
          accessibilityLabel="Rate this app"
          testID="rating"
        />,
      );

      expect(screen.getByTestId('rating').props.accessibilityLabel).toBe('Rate this app');
    });

    it('renders one radio per star, defaulting to 5', async () => {
      await render(<RatingStars value={0} onChange={() => {}} />);

      expect(screen.getAllByRole('radio')).toHaveLength(5);
    });

    it('respects a custom max', async () => {
      await render(<RatingStars value={0} max={3} onChange={() => {}} />);

      expect(screen.getAllByRole('radio')).toHaveLength(3);
    });

    it('marks only the current value as checked', async () => {
      await render(<RatingStars value={3} onChange={() => {}} />);

      expect(screen.getByRole('radio', { name: '2 stars' }).props.accessibilityState.checked).toBe(
        false,
      );
      expect(screen.getByRole('radio', { name: '3 stars' }).props.accessibilityState.checked).toBe(
        true,
      );
    });

    it('uses the singular label for the first star', async () => {
      await render(<RatingStars value={0} onChange={() => {}} />);

      expect(screen.getByRole('radio', { name: '1 star' })).toBeOnTheScreen();
    });

    it('calls onChange with the pressed star', async () => {
      const onChange = jest.fn();
      await render(<RatingStars value={2} onChange={onChange} />);

      fireEvent.press(screen.getByRole('radio', { name: '4 stars' }));

      expect(onChange).toHaveBeenCalledWith(4);
    });

    it('still reports a press on the already-checked star', async () => {
      const onChange = jest.fn();
      await render(<RatingStars value={3} onChange={onChange} />);

      fireEvent.press(screen.getByRole('radio', { name: '3 stars' }));

      expect(onChange).toHaveBeenCalledWith(3);
    });
  });

  describe('prop forwarding', () => {
    it('merges a custom style over the container', async () => {
      await render(<RatingStars value={0} style={{ marginTop: 8 }} testID="rating" />);

      expect(screen.getByTestId('rating')).toHaveStyle({ marginTop: 8 });
    });
  });
});
