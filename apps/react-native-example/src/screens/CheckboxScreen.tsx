import { Checkbox, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const LabeledCheckbox = ({
  label,
  value,
  indeterminate,
  onValueChange,
  disabled,
}: {
  label: string;
  value: boolean;
  indeterminate?: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
}) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Checkbox
        value={value}
        indeterminate={indeterminate}
        onValueChange={onValueChange}
        disabled={disabled}
        accessibilityLabel={label}
      />
      <Text>{label}</Text>
    </View>
  );
};

const INITIAL_ITEMS = { apples: true, bread: false, milk: true };

export const CheckboxScreen = () => {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const values = Object.values(items);
  const allChecked = values.every(Boolean);
  const someChecked = values.some(Boolean);

  function toggle(key: keyof typeof items) {
    setItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleAll() {
    const next = !allChecked;
    setItems({ apples: next, bread: next, milk: next });
  }

  return (
    <>
      <Section title="States">
        <View style={{ gap: 16 }}>
          <LabeledCheckbox label="Unchecked" value={false} />
          <LabeledCheckbox label="Checked" value={true} />
          <LabeledCheckbox label="Indeterminate" value={false} indeterminate />
        </View>
      </Section>

      <Section title="Disabled">
        <View style={{ gap: 16 }}>
          <LabeledCheckbox label="Unchecked, disabled" value={false} disabled />
          <LabeledCheckbox label="Checked, disabled" value disabled />
        </View>
      </Section>

      <Section
        title="Select all"
        description="indeterminate is derived from the group, not stored as its own state"
      >
        <View style={{ gap: 16 }}>
          <LabeledCheckbox
            label="Shopping list"
            value={allChecked}
            indeterminate={someChecked && !allChecked}
            onValueChange={toggleAll}
          />
          <View style={{ gap: 12, marginStart: 24 }}>
            <LabeledCheckbox
              label="Apples"
              value={items.apples}
              onValueChange={() => toggle('apples')}
            />
            <LabeledCheckbox
              label="Bread"
              value={items.bread}
              onValueChange={() => toggle('bread')}
            />
            <LabeledCheckbox label="Milk" value={items.milk} onValueChange={() => toggle('milk')} />
          </View>
        </View>
      </Section>
    </>
  );
};
