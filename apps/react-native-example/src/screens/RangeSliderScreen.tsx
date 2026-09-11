import { RangeSlider, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const RangeSliderScreen = () => {
  const [price, setPrice] = useState<[number, number]>([20, 80]);
  const [age, setAge] = useState<[number, number]>([25, 45]);

  return (
    <>
      <Section title="Basic" description="Drag either thumb, or tap the track to jump it">
        <Text style={{ marginBottom: 8 }}>{`$${price[0]} – $${price[1]}`}</Text>
        <RangeSlider
          value={price}
          onChange={setPrice}
          minLabel="Minimum price"
          maxLabel="Maximum price"
        />
      </Section>

      <Section title="With marks and minDistance" description="Thumbs stay at least 5 apart">
        <Text style={{ marginBottom: 8 }}>{`${age[0]} – ${age[1]} years`}</Text>
        <RangeSlider
          value={age}
          onChange={setAge}
          minDistance={5}
          minLabel="Minimum age"
          maxLabel="Maximum age"
          marks={[
            { value: 0, label: '0' },
            { value: 50, label: '50' },
            { value: 100, label: '100' },
          ]}
        />
      </Section>

      <Section title="Disabled" description="opacity dims, drag is inert">
        <RangeSlider value={[30, 70]} onChange={() => {}} disabled />
      </Section>

      <View style={{ height: 200 }} />
    </>
  );
};
