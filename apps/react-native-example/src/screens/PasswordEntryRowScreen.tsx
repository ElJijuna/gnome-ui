import { Lock } from '@gnome-ui/icons';
import {
  BoxedList,
  EntryRow,
  Icon,
  PasswordEntryRow,
  PreferencesGroup,
  Text,
} from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const PasswordEntryRowScreen = () => {
  const [password, setPassword] = useState('hunter2');
  const [empty, setEmpty] = useState('');
  const [token, setToken] = useState('npm_1a2b3c4d5e6f7g8h9i0j');
  const [signup, setSignup] = useState('');
  const [confirm, setConfirm] = useState('');

  return (
    <>
      <Section title="Masked" description="Tap the eye to reveal what has been typed">
        <BoxedList>
          <PasswordEntryRow title="Password" value={password} onValueChange={setPassword} />
        </BoxedList>
      </Section>

      <Section title="Empty" description="The title still floats as the placeholder">
        <BoxedList>
          <PasswordEntryRow title="Password" value={empty} onValueChange={setEmpty} />
        </BoxedList>
      </Section>

      <Section
        title="With leading and extra trailing"
        description="Your widgets sit before the eye"
      >
        <BoxedList>
          <PasswordEntryRow
            title="Access token"
            value={token}
            onValueChange={setToken}
            leading={<Icon icon={Lock} />}
            trailing={
              <Text variant="caption" color="dim">
                {token.length}
              </Text>
            }
          />
        </BoxedList>
      </Section>

      <Section title="Disabled" description="Row dimmed, reveal button unavailable">
        <BoxedList>
          <PasswordEntryRow title="Password" defaultValue="hunter2" disabled />
        </BoxedList>
      </Section>

      <Section title="A real sign-up form" description="new-password for both fields">
        <PreferencesGroup
          title="Create an account"
          description="Passwords must be at least 8 characters."
        >
          <BoxedList>
            <EntryRow title="Email" value="" onValueChange={() => {}} autoCapitalize="none" />
            <PasswordEntryRow
              title="Password"
              value={signup}
              onValueChange={setSignup}
              autoComplete="new-password"
            />
            <PasswordEntryRow
              title="Confirm password"
              value={confirm}
              onValueChange={setConfirm}
              autoComplete="new-password"
            />
          </BoxedList>
        </PreferencesGroup>
      </Section>

      <View style={{ height: 200 }} />
    </>
  );
};
