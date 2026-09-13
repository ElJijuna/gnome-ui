import { RatingStars, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const RatingStarsScreen = () => {
  const [rating, setRating] = useState(3);
  const [small, setSmall] = useState(2);

  return (
    <>
      <Section title="Interactive" description="Tap a star to set the rating">
        <View style={{ alignItems: 'flex-start', gap: 8 }}>
          <RatingStars value={rating} onChange={setRating} accessibilityLabel="Rate this app" />
          <Text variant="caption" color="dim">
            {rating} out of 5
          </Text>
        </View>
      </Section>

      <Section title="Read-only" description="Omit onChange for a summary display, e.g. an average">
        <View style={{ gap: 8 }}>
          <RatingStars value={4.2} accessibilityLabel="Average rating: 4.2 out of 5" />
          <RatingStars value={1} />
          <RatingStars value={0} />
        </View>
      </Section>

      <Section title="Sizes">
        <View style={{ gap: 8 }}>
          <RatingStars value={3} size="sm" />
          <RatingStars value={3} size="md" />
          <RatingStars value={3} size="lg" />
        </View>
      </Section>

      <Section title="Custom max" description="10-point scale">
        <RatingStars value={7} max={10} />
      </Section>

      <Section title="Disabled" description="Always renders as read-only, even with onChange">
        <View style={{ alignItems: 'flex-start', gap: 8 }}>
          <RatingStars value={small} onChange={setSmall} disabled />
        </View>
      </Section>
    </>
  );
};
