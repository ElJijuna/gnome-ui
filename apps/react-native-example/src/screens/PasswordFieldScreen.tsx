import { PasswordField } from '@gnome-ui/react-native';
import { useState } from 'react';

import { Section } from '../Section';

export const PasswordFieldScreen = () => {
  const [password, setPassword] = useState('');

  return (
    <>
      <Section title="Basic" description="Peek toggle reveals the value as plain text">
        <PasswordField
          label="Password"
          value={password}
          onChangeText={setPassword}
          helperText="At least 8 characters"
          autoComplete="new-password"
        />
      </Section>

      <Section title="Error state" description="Replaces helperText, colors the border">
        <PasswordField label="Password" error="Password is too short" />
      </Section>

      <Section title="Not revealable" description="revealable={false} hides the peek toggle">
        <PasswordField label="PIN" revealable={false} />
      </Section>

      <Section title="Disabled" description="opacity dims, editable={false}">
        <PasswordField label="Password" value="hunter2" editable={false} />
      </Section>
    </>
  );
};
