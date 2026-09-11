import { Warning } from '@gnome-ui/icons';
import { Blockquote, Icon } from '@gnome-ui/react-native';
import { View } from 'react-native';

import { Section } from '../Section';

export const BlockquoteScreen = () => {
  return (
    <>
      <Section title="Default" description="Neutral left border, for general quotations">
        <Blockquote cite="Ada Lovelace, 1842">
          The Analytical Engine has no pretensions to originate anything.
        </Blockquote>
      </Section>

      <Section title="Variants" description="Five severity levels, matching Banner/Chip">
        <View style={{ gap: 12 }}>
          <Blockquote variant="info">
            Tip: pair this with WrapBox for multi-quote layouts.
          </Blockquote>
          <Blockquote variant="warning">
            This API is deprecated and will be removed in v3.
          </Blockquote>
          <Blockquote variant="error">Build failed — see the log for details.</Blockquote>
          <Blockquote variant="success">All checks passed.</Blockquote>
        </View>
      </Section>

      <Section title="With icon" description="Reinforces the variant intent">
        <Blockquote variant="warning" icon={<Icon icon={Warning} size="sm" />}>
          Back up your data before continuing.
        </Blockquote>
      </Section>

      <View style={{ height: 200 }} />
    </>
  );
};
