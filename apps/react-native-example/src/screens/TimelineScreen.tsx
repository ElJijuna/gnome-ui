import { Check } from '@gnome-ui/icons';
import { Icon, Text, Timeline, useGnomeTheme } from '@gnome-ui/react-native';

import { Section } from '../Section';

export const TimelineScreen = () => {
  const theme = useGnomeTheme();

  return (
    <>
      <Section title="Vertical (default)" description="Timestamps + icons + a plain dot">
        <Timeline
          items={[
            {
              leading: (
                <Text variant="caption" color="dim">
                  10:00
                </Text>
              ),
              icon: <Icon icon={Check} size="sm" tintColor={theme.accentFgColor} />,
              content: <Text variant="body">Order placed</Text>,
            },
            {
              leading: (
                <Text variant="caption" color="dim">
                  10:32
                </Text>
              ),
              icon: <Icon icon={Check} size="sm" tintColor={theme.accentFgColor} />,
              content: <Text variant="body">Packed and ready for pickup</Text>,
            },
            {
              leading: (
                <Text variant="caption" color="dim">
                  14:05
                </Text>
              ),
              content: <Text variant="body">Out for delivery</Text>,
            },
          ]}
        />
      </Section>

      <Section title="Dotted variant" description="For future/pending events">
        <Timeline
          variant="dotted"
          items={[
            { content: <Text variant="body">Delivered</Text> },
            { content: <Text variant="body">Feedback requested</Text> },
          ]}
        />
      </Section>

      <Section title="No connector" description='variant="none" — each node stands alone'>
        <Timeline
          variant="none"
          items={[
            { content: <Text variant="body">Signed up</Text> },
            { content: <Text variant="body">Verified email</Text> },
            { content: <Text variant="body">First project created</Text> },
          ]}
        />
      </Section>

      <Section
        title="Horizontal"
        description="Stepper-style — scrolls if it doesn't fit (wraps in a ScrollView)"
      >
        <Timeline
          orientation="horizontal"
          items={[
            {
              leading: (
                <Text variant="caption" color="dim">
                  Mon
                </Text>
              ),
              icon: <Icon icon={Check} size="sm" tintColor={theme.accentFgColor} />,
              content: <Text variant="caption">Ordered</Text>,
            },
            {
              leading: (
                <Text variant="caption" color="dim">
                  Wed
                </Text>
              ),
              icon: <Icon icon={Check} size="sm" tintColor={theme.accentFgColor} />,
              content: <Text variant="caption">Shipped</Text>,
            },
            {
              leading: (
                <Text variant="caption" color="dim">
                  Fri
                </Text>
              ),
              content: <Text variant="caption">Delivered</Text>,
            },
          ]}
        />
      </Section>

      <Section title="Horizontal + dotted" description="Both reimaginings combined">
        <Timeline
          orientation="horizontal"
          variant="dotted"
          items={[
            { content: <Text variant="caption">Applied</Text> },
            { content: <Text variant="caption">Interview</Text> },
            { content: <Text variant="caption">Offer</Text> },
          ]}
        />
      </Section>
    </>
  );
};
