import { FileTypeIcon, Text } from '@gnome-ui/react-native';
import { View } from 'react-native';

import { Section } from '../Section';

const NAMES = [
  'photo.png',
  'song.mp3',
  'clip.mp4',
  'report.pdf',
  'archive.zip',
  'letter.docx',
  'budget.xlsx',
  'slides.pptx',
  'font.woff2',
  'install.sh',
  'notes.txt',
  'data.xyz123',
];

export const FileTypeIconScreen = () => {
  return (
    <>
      <Section title="From a file name" description="Resolved from the extension">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
          {NAMES.map((name) => (
            <View key={name} style={{ alignItems: 'center', gap: 4, width: 72 }}>
              <FileTypeIcon name={name} size="lg" />
              <Text variant="caption" color="dim" numberOfLines={1}>
                {name}
              </Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="From a MIME type" description="Also resolves folders via inode/directory">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
          <FileTypeIcon mimeType="image/png" size="lg" />
          <FileTypeIcon mimeType="inode/directory" size="lg" />
          <FileTypeIcon isFolder size="lg" />
        </View>
      </Section>

      <Section title="Thumbnail" description="Renders the image instead of the resolved icon">
        <FileTypeIcon
          name="cover.jpg"
          thumbnail="https://picsum.photos/seed/gnome-ui/64"
          size="lg"
        />
      </Section>

      <Section title="Sizes">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <FileTypeIcon name="report.pdf" size="sm" />
          <FileTypeIcon name="report.pdf" size="md" />
          <FileTypeIcon name="report.pdf" size="lg" />
        </View>
      </Section>
    </>
  );
};
