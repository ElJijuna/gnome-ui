import {
  ActionRow,
  BoxedList,
  Button,
  Dropdown,
  PreferencesGroup,
  Switch,
  Text,
} from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const PreferencesGroupScreen = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [telemetry, setTelemetry] = useState(false);
  const [language, setLanguage] = useState('en');

  return (
    <>
      <Section title="Title only" description="The simplest form">
        <PreferencesGroup title="Appearance">
          <BoxedList>
            <ActionRow
              title="Dark mode"
              trailing={
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  accessibilityLabel="Dark mode"
                />
              }
            />
            <ActionRow
              title="Animations"
              trailing={
                <Switch
                  value={animations}
                  onValueChange={setAnimations}
                  accessibilityLabel="Animations"
                />
              }
            />
          </BoxedList>
        </PreferencesGroup>
      </Section>

      <Section title="With a description" description="Dimmed caption below the title">
        <PreferencesGroup
          title="Privacy"
          description="These settings only affect this device — nothing is synced."
        >
          <BoxedList>
            <ActionRow
              title="Send usage data"
              subtitle="Anonymous crash reports"
              trailing={
                <Switch
                  value={telemetry}
                  onValueChange={setTelemetry}
                  accessibilityLabel="Send usage data"
                />
              }
            />
          </BoxedList>
        </PreferencesGroup>
      </Section>

      <Section title="With a header suffix" description="A reset action on the trailing edge">
        <PreferencesGroup
          title="Language"
          description="Used across the whole app."
          headerSuffix={
            <Button variant="flat" onPress={() => setLanguage('en')}>
              Reset
            </Button>
          }
        >
          <BoxedList>
            <ActionRow
              title="Display language"
              trailing={
                <Dropdown
                  value={language}
                  onChange={setLanguage}
                  accessibilityLabel="Display language"
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Español' },
                    { value: 'de', label: 'Deutsch' },
                  ]}
                />
              }
            />
          </BoxedList>
        </PreferencesGroup>
      </Section>

      <Section title="No header" description="Just the content — a bare grouping wrapper">
        <PreferencesGroup>
          <BoxedList>
            <ActionRow title="About this app" subtitle="Version 1.5.0" />
          </BoxedList>
        </PreferencesGroup>
      </Section>

      <Section title="Stacked" description="Several groups make a preferences page">
        <View style={{ gap: 24 }}>
          <PreferencesGroup title="Network">
            <BoxedList>
              <ActionRow title="Wi-Fi" subtitle="Home Network" />
            </BoxedList>
          </PreferencesGroup>
          <PreferencesGroup title="Storage" description="42 GB of 128 GB used.">
            <BoxedList>
              <ActionRow title="Clear cache" subtitle="1.2 GB" />
            </BoxedList>
          </PreferencesGroup>
          <Text variant="caption" color="dim">
            PreferencesPage (Tier 13) will own this outer stacking.
          </Text>
        </View>
      </Section>
    </>
  );
};
