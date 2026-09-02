import { RadioButton, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const LabeledRadio = ({
  label,
  selected,
  onSelect,
  disabled,
}: {
  label: string;
  selected: boolean;
  onSelect?: () => void;
  disabled?: boolean;
}) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <RadioButton
        value={selected}
        onSelect={onSelect}
        disabled={disabled}
        accessibilityLabel={label}
      />
      <Text>{label}</Text>
    </View>
  );
};

const SIZES = ['Small', 'Medium', 'Large'] as const;

export const RadioButtonScreen = () => {
  const [size, setSize] = useState<(typeof SIZES)[number]>('Medium');

  return (
    <>
      <Section
        title="Group"
        description="RN has no name-attribute grouping — the parent owns selection state"
      >
        <View style={{ gap: 16 }}>
          {SIZES.map((option) => (
            <LabeledRadio
              key={option}
              label={option}
              selected={size === option}
              onSelect={() => setSize(option)}
            />
          ))}
        </View>
      </Section>

      <Section title="Disabled">
        <View style={{ gap: 16 }}>
          <LabeledRadio label="Unselected, disabled" selected={false} disabled />
          <LabeledRadio label="Selected, disabled" selected disabled />
        </View>
      </Section>
    </>
  );
};
