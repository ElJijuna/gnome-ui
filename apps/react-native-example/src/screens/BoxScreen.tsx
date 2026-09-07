import { Folder, Star } from '@gnome-ui/icons';
import { Badge, Box, Button, Card, Icon, Text, useGnomeTheme } from '@gnome-ui/react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

/** Tinted block standing in for a child, so gaps and alignment are visible. */
const Item = ({ children, width }: { children: ReactNode; width?: number }) => {
  const theme = useGnomeTheme();

  return (
    <View
      style={{
        backgroundColor: theme.cardShadeColor,
        borderRadius: theme.radiusSm,
        paddingVertical: 8,
        paddingHorizontal: 12,
        width,
      }}
    >
      <Text variant="caption">{children}</Text>
    </View>
  );
};

export const BoxScreen = () => {
  const theme = useGnomeTheme();

  return (
    <>
      <Section title="Vertical" description="The default — column, spacing 6, align stretch">
        <Box>
          <Item>First</Item>
          <Item>Second</Item>
          <Item>Third</Item>
        </Box>
      </Section>

      <Section title="Horizontal" description="Row, spacing 6, align center by default">
        <Box orientation="horizontal">
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Box>
      </Section>

      <Section title="Spacing scale" description="The seven GNOME HIG values: 3 → 48 dp">
        <Box spacing={18}>
          {([3, 6, 12, 18, 24, 32, 48] as const).map((value) => (
            <Box key={value} orientation="horizontal" spacing={6} align="center">
              <Text variant="caption" color="dim" style={{ width: 28 }}>
                {value}
              </Text>
              <Box orientation="horizontal" spacing={value} style={{ flex: 1 }}>
                <Item width={40}>{''}</Item>
                <Item width={40}>{''}</Item>
                <Item width={40}>{''}</Item>
              </Box>
            </Box>
          ))}
        </Box>
      </Section>

      <Section title="justify" description="Main-axis distribution — start, center, end, between">
        <Box spacing={12}>
          {(['start', 'center', 'end', 'space-between'] as const).map((value) => (
            <Box key={value} spacing={3}>
              <Text variant="caption" color="dim">
                {value}
              </Text>
              <Box
                orientation="horizontal"
                justify={value}
                style={{
                  backgroundColor: theme.cardShadeColor,
                  borderRadius: theme.radiusSm,
                  padding: 6,
                }}
              >
                <Item width={56}>{''}</Item>
                <Item width={56}>{''}</Item>
              </Box>
            </Box>
          ))}
        </Box>
      </Section>

      <Section title="align" description="Cross-axis — start, center, end, stretch">
        <Box orientation="horizontal" spacing={12}>
          {(['start', 'center', 'end', 'stretch'] as const).map((value) => (
            <Box
              key={value}
              align={value}
              spacing={6}
              style={{
                flex: 1,
                height: 90,
                backgroundColor: theme.cardShadeColor,
                borderRadius: theme.radiusSm,
                padding: 6,
              }}
            >
              <Text variant="caption" color="dim">
                {value}
              </Text>
              <Item>{''}</Item>
            </Box>
          ))}
        </Box>
      </Section>

      <Section title="padding" description="Inner padding on all sides, same scale">
        <Box
          padding={24}
          spacing={6}
          style={{ backgroundColor: theme.cardShadeColor, borderRadius: theme.radiusSm }}
        >
          <Item>padding = 24</Item>
        </Box>
      </Section>

      <Section title="Real composition" description="What Box is actually for">
        <Box spacing={12}>
          <Box orientation="horizontal" spacing={6} align="center">
            <Icon icon={Folder} size="sm" />
            <Text variant="caption-heading" color="dim">
              Documents
            </Text>
            <Badge>4</Badge>
          </Box>
          <Card>
            <Box spacing={6}>
              <Text variant="title-4">Quarterly report</Text>
              <Text color="dim">Updated 2 hours ago</Text>
            </Box>
          </Card>
          <Box orientation="horizontal" spacing={6} justify="end">
            <Button variant="flat" leadingIcon={<Icon icon={Star} size="sm" />}>
              Star
            </Button>
            <Button variant="suggested">Open</Button>
          </Box>
        </Box>
      </Section>
    </>
  );
};
