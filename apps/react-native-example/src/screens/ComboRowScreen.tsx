import { Applications, Lock, Star } from '@gnome-ui/icons';
import { BoxedList, ComboRow, Icon, PreferencesGroup, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
];

const THEMES = [
  { value: 'system', label: 'Follow system' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const SORTS = [
  { value: 'downloads', label: 'Downloads' },
  { value: 'quality', label: 'Quality' },
  { value: 'updated', label: 'Recently updated' },
  { value: 'legacy', label: 'Legacy score', disabled: true },
];

export const ComboRowScreen = () => {
  const [language, setLanguage] = useState('en');
  const [appTheme, setAppTheme] = useState('system');
  const [sort, setSort] = useState<string | undefined>(undefined);
  const [uncontrolled, setUncontrolled] = useState('');

  return (
    <>
      <Section title="Basic" description="Title plus a selector at the trailing edge">
        <BoxedList>
          <ComboRow
            title="Language"
            options={LANGUAGES}
            value={language}
            onValueChange={setLanguage}
          />
        </BoxedList>
        <Text variant="caption" color="dim">
          value: {language}
        </Text>
      </Section>

      <Section title="With subtitle and leading icon" description="The full ActionRow shape">
        <BoxedList>
          <ComboRow
            title="Appearance"
            subtitle="Applies to the whole app"
            leading={<Icon icon={Applications} />}
            options={THEMES}
            value={appTheme}
            onValueChange={setAppTheme}
          />
        </BoxedList>
      </Section>

      <Section title="Nothing selected" description="Falls back to the — placeholder">
        <BoxedList>
          <ComboRow title="Sort packages by" options={SORTS} value={sort} onValueChange={setSort} />
        </BoxedList>
      </Section>

      <Section title="Disabled" description="Row dimmed, selector unavailable">
        <BoxedList>
          <ComboRow
            title="Registry"
            subtitle="Managed by your organisation"
            leading={<Icon icon={Lock} />}
            options={[{ value: 'npm', label: 'npmjs.org' }]}
            value="npm"
            disabled
          />
        </BoxedList>
      </Section>

      <Section title="A settings page" description="Several rows in one PreferencesGroup">
        <PreferencesGroup title="Preferences" description="Everything is stored on this device.">
          <BoxedList>
            <ComboRow
              title="Language"
              options={LANGUAGES}
              value={language}
              onValueChange={setLanguage}
            />
            <ComboRow
              title="Appearance"
              options={THEMES}
              value={appTheme}
              onValueChange={setAppTheme}
            />
            <ComboRow
              title="Default sort"
              leading={<Icon icon={Star} />}
              options={SORTS}
              defaultValue="downloads"
              onValueChange={setUncontrolled}
            />
          </BoxedList>
        </PreferencesGroup>
        <Text variant="caption" color="dim">
          uncontrolled last change: {uncontrolled || '(none)'}
        </Text>
      </Section>

      <View style={{ height: 260 }} />
    </>
  );
};
