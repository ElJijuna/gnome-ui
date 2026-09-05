import { Expander, Text, TextField } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const ExpanderScreen = () => {
  const [controlledExpanded, setControlledExpanded] = useState(false);

  return (
    <>
      <Section title="Basic" description="Collapsed by default">
        <Expander label="Show advanced options">
          <TextField label="Custom endpoint" placeholder="https://" />
        </Expander>
      </Section>

      <Section title="Default expanded">
        <Expander label="Show details" defaultExpanded>
          <Text>
            Everything nested here stays mounted while collapsed — only the animated height
            hides it.
          </Text>
        </Expander>
      </Section>

      <Section title="Non-string label">
        <Expander
          label={
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <Text style={{ fontWeight: '600' }}>Error details</Text>
              <Text style={{ opacity: 0.6 }}>(1 issue)</Text>
            </View>
          }
        >
          <Text>NetworkError: could not resolve host.</Text>
        </Expander>
      </Section>

      <Section title="Disabled">
        <Expander label="Unavailable on this plan" disabled>
          <Text>You will not see this.</Text>
        </Expander>
      </Section>

      <Section title="Controlled" description={`Externally expanded: ${controlledExpanded}`}>
        <Expander
          label="Controlled from outside"
          expanded={controlledExpanded}
          onExpandedChange={setControlledExpanded}
        >
          <Text>Toggling this header still calls onExpandedChange.</Text>
        </Expander>
      </Section>
    </>
  );
};
