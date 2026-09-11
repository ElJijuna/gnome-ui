import {
  FilterableMultiSelectDropdown,
  type MultiSelectDropdownOption,
} from '@gnome-ui/react-native';
import { useState } from 'react';

import { Section } from '../Section';

const LANGUAGES: MultiSelectDropdownOption[] = [
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'py', label: 'Python', description: 'A general-purpose language' },
  { value: 'rb', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rs', label: 'Rust' },
  { value: 'swift', label: 'Swift' },
  { value: 'kt', label: 'Kotlin' },
  { value: 'cobol', label: 'COBOL', disabled: true },
];

export const FilterableMultiSelectDropdownScreen = () => {
  const [languages, setLanguages] = useState<string[]>(['ts']);

  return (
    <>
      <Section
        title="Long option list"
        description="Opening focuses the filter field automatically"
      >
        <FilterableMultiSelectDropdown
          options={LANGUAGES}
          value={languages}
          onChange={setLanguages}
          placeholder="Select languages"
          filterPlaceholder="Search languages…"
          accessibilityLabel="Languages"
        />
      </Section>

      <Section title="Disabled" description="No press response, dimmed trigger">
        <FilterableMultiSelectDropdown
          options={LANGUAGES}
          value={['ts', 'py']}
          onChange={() => {}}
          disabled
        />
      </Section>
    </>
  );
};
