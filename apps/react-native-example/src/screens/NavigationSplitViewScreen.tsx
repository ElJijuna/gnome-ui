import { GoPrevious } from '@gnome-ui/icons';
import {
  ActionRow,
  BoxedList,
  IconButton,
  NavigationSplitView,
  Text,
  useBreakpoint,
  useGnomeTheme,
} from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const MAILBOXES = ['Inbox', 'Starred', 'Sent', 'Drafts', 'Archive'];

export const NavigationSplitViewScreen = () => {
  const theme = useGnomeTheme();
  const { isNarrow, width } = useBreakpoint();
  const [showContent, setShowContent] = useState(false);
  const [selected, setSelected] = useState('Inbox');

  return (
    <>
      <Section
        title="List + detail"
        description={`Window is ${Math.round(width)} dp wide, so this is currently "${
          isNarrow ? 'narrow' : 'wide'
        }" — only phones/split screens ≤ 400 dp show one pane at a time; tablets show both side by side`}
      >
        <View
          style={{
            height: 420,
            borderRadius: theme.radiusMd,
            borderWidth: 1,
            borderColor: theme.borderSubtle,
            overflow: 'hidden',
          }}
        >
          <NavigationSplitView
            showContent={showContent}
            sidebar={
              <BoxedList>
                {MAILBOXES.map((label) => (
                  <ActionRow
                    key={label}
                    title={label}
                    onPress={() => {
                      setSelected(label);
                      setShowContent(true);
                    }}
                  />
                ))}
              </BoxedList>
            }
            content={
              <View style={{ flex: 1, padding: theme.space4 }}>
                {isNarrow && (
                  <IconButton
                    icon={GoPrevious}
                    label="Back"
                    variant="flat"
                    onPress={() => setShowContent(false)}
                    style={{ alignSelf: 'flex-start', marginBottom: theme.space3 }}
                  />
                )}
                <Text variant="title-3">{selected}</Text>
                <Text variant="body" color="dim" style={{ marginTop: theme.space2 }}>
                  Detail content for "{selected}" goes here.
                </Text>
              </View>
            }
          />
        </View>
      </Section>
    </>
  );
};
