import { PathBar, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const FULL_PATH = [
  { label: 'Home', path: '/home' },
  { label: 'Documents', path: '/home/documents' },
  { label: 'Projects', path: '/home/documents/projects' },
  { label: 'gnome-ui', path: '/home/documents/projects/gnome-ui' },
];

export const PathBarScreen = () => {
  const [path, setPath] = useState(FULL_PATH);

  return (
    <>
      <Section title="Basic" description="Press an ancestor segment to navigate">
        <View style={{ gap: 8 }}>
          <PathBar
            segments={path}
            onNavigate={(_, index) => setPath(FULL_PATH.slice(0, index + 1))}
          />
          {path.length < FULL_PATH.length && (
            <Text
              color="accent"
              onPress={() => setPath(FULL_PATH)}
              accessibilityRole="button"
              accessibilityLabel="Reset path"
            >
              Reset
            </Text>
          )}
        </View>
      </Section>

      <Section title="With icons">
        <PathBar
          segments={[
            { label: 'Home', path: '/home', icon: <Text>🏠</Text> },
            { label: 'Pictures', path: '/home/pictures', icon: <Text>🖼️</Text> },
            { label: 'Vacation', path: '/home/pictures/vacation', icon: <Text>📁</Text> },
          ]}
          onNavigate={() => {}}
        />
      </Section>

      <Section title="Single segment" description="No separator, no interactive segments">
        <PathBar segments={[{ label: 'Home', path: '/home' }]} />
      </Section>

      <Section title="Long labels" description="Each segment truncates independently">
        <PathBar
          segments={[
            { label: 'A Very Long Root Folder Name', path: '/a' },
            { label: 'An Even Longer Nested Folder Name Here', path: '/a/b' },
            { label: 'Current Folder With A Long Name Too', path: '/a/b/c' },
          ]}
          onNavigate={() => {}}
        />
      </Section>
    </>
  );
};
