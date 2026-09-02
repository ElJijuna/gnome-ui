import { TextField } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const TextFieldScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('not-an-email');
  const [password, setPassword] = useState('');

  return (
    <>
      <Section title="Basic">
        <TextField
          label="Username"
          placeholder="e.g. eljijuna"
          value={username}
          onChangeText={setUsername}
        />
      </Section>

      <Section title="Helper text">
        <TextField
          label="Display name"
          helperText="Shown to other users instead of your username"
        />
      </Section>

      <Section title="Error state">
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={email.includes('@') ? undefined : 'Enter a valid email address'}
        />
      </Section>

      <Section title="Secure entry">
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      </Section>

      <Section title="Disabled">
        <View style={{ gap: 12 }}>
          <TextField label="Account ID" value="usr_9f3a21" editable={false} />
        </View>
      </Section>
    </>
  );
};
