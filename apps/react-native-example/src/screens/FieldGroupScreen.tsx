import { FieldGroup, RadioButton, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const LabeledRadio = ({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect?: () => void;
}) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <RadioButton value={selected} onSelect={onSelect} accessibilityLabel={label} />
      <Text>{label}</Text>
    </View>
  );
};

const METHODS = ['Email', 'SMS', 'Push notification'] as const;

export const FieldGroupScreen = () => {
  const [method, setMethod] = useState<(typeof METHODS)[number]>('Email');

  return (
    <>
      <Section title="With helper text" description="Plain labeled grouping, outside a BoxedList">
        <FieldGroup label="Notification method" helperText="Choose how you want to be notified.">
          {METHODS.map((option) => (
            <LabeledRadio
              key={option}
              label={option}
              selected={method === option}
              onSelect={() => setMethod(option)}
            />
          ))}
        </FieldGroup>
      </Section>

      <Section title="With error" description="Replaces helperText, announced as an alert">
        <FieldGroup label="Notification method" error="Select at least one option.">
          {METHODS.map((option) => (
            <LabeledRadio key={option} label={option} selected={false} />
          ))}
        </FieldGroup>
      </Section>

      <Section title="Disabled" description="Dims the group visually">
        <FieldGroup label="Notification method" helperText="Locked by your administrator." disabled>
          {METHODS.map((option) => (
            <LabeledRadio key={option} label={option} selected={option === 'Email'} />
          ))}
        </FieldGroup>
      </Section>
    </>
  );
};
