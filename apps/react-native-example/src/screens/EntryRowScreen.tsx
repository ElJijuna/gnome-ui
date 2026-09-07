import { Delete, MailRead, Person } from '@gnome-ui/icons';
import {
  BoxedList,
  Button,
  EntryRow,
  Icon,
  IconButton,
  PreferencesGroup,
  Text,
} from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const EntryRowScreen = () => {
  const [name, setName] = useState('');
  const [prefilled, setPrefilled] = useState('Ada Lovelace');
  const [email, setEmail] = useState('');
  const [registry, setRegistry] = useState('https://registry.npmjs.org');

  return (
    <>
      <Section title="Empty" description="The title stands in for the placeholder until you type">
        <BoxedList>
          <EntryRow title="Display name" value={name} onValueChange={setName} />
        </BoxedList>
        <Text variant="caption" color="dim">
          value: {name || '(empty)'}
        </Text>
      </Section>

      <Section title="With content" description="The label has floated up out of the way">
        <BoxedList>
          <EntryRow title="Display name" value={prefilled} onValueChange={setPrefilled} />
        </BoxedList>
      </Section>

      <Section title="Leading and trailing" description="An icon in front, an action behind">
        <BoxedList>
          <EntryRow
            title="Email"
            value={email}
            onValueChange={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leading={<Icon icon={MailRead} />}
            trailing={
              email.length > 0 ? (
                <IconButton icon={Delete} label="Clear" onPress={() => setEmail('')} />
              ) : null
            }
          />
        </BoxedList>
      </Section>

      <Section title="Disabled" description="Dimmed and not editable">
        <BoxedList>
          <EntryRow
            title="Username"
            defaultValue="eljijuna"
            leading={<Icon icon={Person} />}
            disabled
          />
        </BoxedList>
      </Section>

      <Section title="In a PreferencesGroup" description="The real settings-page shape">
        <PreferencesGroup
          title="npm registry"
          description="Where packages are fetched from."
          headerSuffix={
            <Button variant="flat" onPress={() => setRegistry('https://registry.npmjs.org')}>
              Reset
            </Button>
          }
        >
          <BoxedList>
            <EntryRow
              title="Registry URL"
              value={registry}
              onValueChange={setRegistry}
              autoCapitalize="none"
            />
            <EntryRow title="Scope" value="" onValueChange={() => {}} />
          </BoxedList>
        </PreferencesGroup>
      </Section>

      <View style={{ height: 240 }} />
    </>
  );
};
