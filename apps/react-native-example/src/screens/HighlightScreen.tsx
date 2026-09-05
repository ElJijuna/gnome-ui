import { Highlight } from '@gnome-ui/react-native';

import { Section } from '../Section';

export const HighlightScreen = () => {
  return (
    <>
      <Section title="Basic" description="A single query term">
        <Highlight text="Preferences for accessibility" query="access" />
      </Section>

      <Section title="Multiple terms" description="Each word highlights independently">
        <Highlight text="The quick brown fox jumps over the lazy dog" query={['quick', 'fox']} />
      </Section>

      <Section title="Case sensitivity" description="Off by default">
        <Highlight text="Hello World, hello there" query="hello" />
        <Highlight text="Hello World, hello there" query="hello" caseSensitive />
      </Section>

      <Section title="No match" description="Renders the plain text unchanged">
        <Highlight text="Nothing matches here" query="xyz" />
      </Section>

      <Section title="Inherits the surrounding variant">
        <Highlight variant="title-3" text="Search results for gnome" query="gnome" />
      </Section>
    </>
  );
};
